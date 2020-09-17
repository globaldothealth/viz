If you want to run this server locally, you will need the following:

|Name|Why|Debian/Ubuntu package|
|--|--|--|
|Colorama|Show some error messages in color|`python3-colorama`|
|Java|Run the Closure compiler|`openjdk-11-jre`|
|NodeJS|Run the JS unit tests|`nodejs`|
|Python 3|Run the server|`python3`|
|Pandas|Massage the data for server ingestion|`python3-pandas`|
|SASS|Generate CSS from SCSS|`ruby-sass`|
|SASS Listen|Regenerate CSS on the fly|N/A|

"SASS listen" comes as a Ruby gen 'sass-listen'. Install it with `sudo gem install sass-listen`.

The Closure compiler is also a dependency for deployment, but it will be automatically fetched when necessary.

If you're running Ubuntu/Debian, here is a command you can run to get all this:

`sudo apt install openjdk-11-jre nodejs python3 python3-pandas ruby-sass ; sudo gem install sass-listen`
