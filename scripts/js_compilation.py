import os

DEBUG = False

def compile_js(quiet=False):

    if not quiet:
        print("Compiling Javascript...")

    cmd = (
        "java -jar tools/closure-compiler.jar "
        "--language_in ECMASCRIPT6 "
        "--compilation_level ADVANCED_OPTIMIZATIONS "
        "" + ("--formatting=pretty_print " if DEBUG else "") + ""
        "--js js/util.js "
        "--js js/view.js "
        "--js js/completenessview.js "
        "--js js/country.js "
        "--js js/mapdatasource.js "
        "--js js/casemapdatasource.js "
        "--js js/completenessmapdatasource.js "
        "--js js/dataprovider.js "
        "--js js/diseasemap.js "
        "--js js/graphing.js "
        "--js js/timeanimation.js "
        "--js js/main.js "
        "--js js/nav.js "
        "--js js/sidebar.js "
        "--js js/countrydashboard.js "
        "--js js/mapview.js "
        "--js js/casemapview.js "
        "--js js/completenessmapview.js "
        "--js js/historicalmapview.js "
        "--js js/rankview.js "
        "--js js/syncview.js "
        "--externs js/externs_chart.js "
        "--externs js/externs_mapbox.js "
        "--js_output_file js/bundle.js"
    )
    if quiet:
        cmd += " 2> /dev/null"
    os.system(cmd)


if __name__ == "__main__":
    compile_js()
