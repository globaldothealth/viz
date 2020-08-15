
# Local development

## With "official" data

Make sure dependencies in `prerequisites.md` are met. Then, to run the
application locally, pick a disease, for instance 'covid-19' and:

`./run covid-19`

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

`./deploy path/to/target`

and then copy the contents of the target directory as appropriate (e.g. to AWS).
