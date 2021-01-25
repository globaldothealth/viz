import datetime
import io
import json
import os
import re

import boto3
import pandas as pd
import pymongo
import requests

_COUNTRY_MAP = {
    'Czechia': 'Czech Republic'
}

_EXCLUDE = ['Puerto Rico']

username = os.environ.get('MONGO_USERNAME')
password = os.environ.get('MONGO_PASSWORD')

client = pymongo.MongoClient(
    f"mongodb+srv://{username}:{password}@covid19-map-cluster01.sc7u9.mongodb.net/covid19?retryWrites=true&w=majority")
db = client.covid19
cases = db.cases


def get_jhu_counts():
    """
    Get latest case count .csv from JHU.

    Return aggregated counts by country as Series.
    """

    now = datetime.datetime.now().strftime("%m-%d-%Y")
    url = f"https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/{now}.csv"
    req = requests.head(url)

    while req.status_code != 200:
        print("Got status " + str(req.status_code) + " for '" + url + "'")
        date = datetime.datetime.now() - datetime.timedelta(days=1)
        now = date.strftime("%m-%d-%Y")
        url = f"https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/{now}.csv"
        req = requests.head(url)

    req = requests.get(url)
    jhu_df = pd.read_csv(io.StringIO(req.text))
    print(f"Retrieved JHU case counts from {now}.")

    jhu_counts = jhu_df['Confirmed'].groupby(
        jhu_df['Country_Region']).sum().reset_index()
    jhu_counts['Country_Region'] = jhu_counts['Country_Region'].apply(
        lambda x: re.sub(r'[^a-zA-Z ]', '', x))
    jhu_counts['Country_Region'] = jhu_counts['Country_Region'].apply(
        lambda x: _COUNTRY_MAP[x] if x in _COUNTRY_MAP.keys() else x)
    jhu_counts = jhu_counts.set_index('Country_Region')
    jhu_counts = pd.Series(jhu_counts.values.flatten(), index=jhu_counts.index)
    return jhu_counts


def generate_country_json():
    """
    Generate json of case counts by country and upload to S3.
    """
    now = datetime.datetime.now().strftime("%m-%d-%Y")
    pipeline = [
        {"$group": {"_id": "$location.country",
                    "caseCount": {"$sum": 1},
                    "lat": {"$first": "$location.geometry.latitude"},
                    "lon": {"$first": "$location.geometry.longitude"}}}
    ]

    results = cases.aggregate(pipeline)
    records = list(results)
    records = [record for record in records if record['_id'] not in _EXCLUDE]

    jhu_counts = get_jhu_counts()

    for record in records:
        country = record['_id']
        try:
            jhu = jhu_counts[country]
            record['jhu'] = int(jhu)
        except:
            print(f"I couldn't find {country} in the JHU case counts.")

    s3 = boto3.client('s3')
    s3.put_object(Body=json.dumps(records),
                  Bucket='covid-19-aggregates', Key="country/latest.json")
    s3.put_object(Body=json.dumps(records),
                  Bucket='covid-19-aggregates', Key=f"country/{now}.json")


def generate_region_json():
    """
    Generate json of case counts by region and upload to S3.
    """
    now = datetime.datetime.now().strftime("%m-%d-%Y")
    pipeline = [
        {"$group": {"_id": "$location.administrativeAreaLevel3",
                    "caseCount": {"$sum": 1},
                    "country": {"$first": "$location.country"},
                    "lat": {"$first": "$location.geometry.latitude"},
                    "lon": {"$first": "$location.geometry.longitude"}}}
    ]

    results = cases.aggregate(pipeline)
    records = list(results)

    s3 = boto3.client('s3')
    s3.put_object(Body=json.dumps(records),
                  Bucket='covid-19-aggregates', Key="regional/latest.json")
    s3.put_object(Body=json.dumps(records),
                  Bucket='covid-19-aggregates', Key=f"regional/{now}.json")


def generate_total_json():
    now = datetime.datetime.now().strftime("%m-%d-%Y")

    count = cases.count_documents({})
    record = {"total": count}

    s3 = boto3.client('s3')
    s3.put_object(Body=json.dumps(record),
                  Bucket='covid-19-aggregates', Key="total/latest.json")
    s3.put_object(Body=json.dumps(record),
                  Bucket='covid-19-aggregates', Key=f"total/{now}.json")


def lambda_handler(event, context):
    generate_country_json()
    generate_region_json()
    generate_total_json()
