Before doing any of the below, make sure dependencies in [`prerequisites.md`](prerequisites.md) are met.
On Mac, I installed `node-sass` from homebrew and `colorama` from pip.

# Local development

## With "official" data

You need to get a mapbox API key and set it to an environment variable:

`export MAPBOX_API_TOKEN="[your-mapbox-api-key-here]"`

Then, to run the application locally, pick a disease, for instance 'covid-19'
and:

`./run covid-19 dev`

Use either 'dev' or 'prod' as the second argument; it currently just picks the URL to point to the data portal.
Then, in your browser, load http://localhost:8000

## With local data

First, start a server to serve your local data from port 8001:

`cd path/to/your/local/data && python3 -m http.server 8001`

Then start the vizualization server:

`./run local`

# Testing

Before deploying, commit your changes or sending a pull request, please run the tests:

`./test`

# Deployment

Run this:

`./deploy covid-19 dev path/to/target`

for the `covid-19` disease (replace as needed) and dev portal link (or prod) and then copy the contents of the target directory as appropriate (e.g. to AWS).
