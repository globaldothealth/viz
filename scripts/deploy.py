"""
Makes it easy and painless to deploy the site and make all necessary changes
so that it's immediately ready to serve in production.
"""
import glob
import json
import os
import shlex
import subprocess
import sys

from colorama import Fore, Style

import data_util
import js_compilation


# Files and directories that should be deployed. Everything else will be ignored.
INCLUDE_LIST = [
    "index.html",
    "c",
    "js/bundle.js",
    "css/styles.css",
    "img/*",
]

HTML_FILES = [
    "country.html",
    "index.html",
]

with open("config.json") as f:
    CONFIG = json.loads(f.read())
    f.close()

MAPBOX_PROD_API_TOKEN = "pk.eyJ1IjoiaGVhbHRobWFwIiwiYSI6ImNrOGl1NGNldTAyYXYzZnBqcnBmN3RjanAifQ.H377pe4LPPcymeZkUBiBtg"

# Returns True if everything we need is here, False otherwise.
def check_dependencies():
    try:
        subprocess.check_call(shlex.split("sass --version"),
                              stdout=subprocess.DEVNULL)
    except (subprocess.CalledProcessError, OSError):
        print("Please install 'sass' first.")
        return False
    # If the Closure compiler isn't available, let's get that setup.
    if not os.path.exists("tools/closure-compiler.jar"):
        print("The Closure compiler isn't available, fetching it. "
              "This will only happen once.")
        if not os.path.exists("tools"):
            os.mkdir("tools")
        os.system("curl \"https://repo1.maven.org/maven2/com/google/javascript/"
                  "closure-compiler/v20200830/closure-compiler-v20200830.jar"
                  "\" > tools/closure-compiler.jar")

    return True


def insert_analytics_code(quiet=False):
    main_page = ""
    with open("analytics.js") as f:
        code = f.read()
        f.close()
    inserted = False
    with open("index.html") as f:
        for line in f:
            if not inserted and "<script" in line:
                main_page += code
                inserted = True
            main_page += line
        f.close()

    # Remove the file and write a modified version
    os.system("rm index.html")
    with open("index.html", "w") as f:
        f.write(main_page)
        f.close()


def link_to_compiled_js_in_html(html_file):
    # Now link to the compiled code in the HTML file
    html = ""
    scripting_time = False
    with open(html_file) as f:
        for line in f:
            if line.strip() == "<!-- /js -->":
                scripting_time = False
                html += '<script src="/js/bundle.js"></script>\n'
            elif scripting_time:
                continue
            elif line.strip() == "<!-- js -->":
                scripting_time = True
            else:
                html += line
        f.close()

    # Remove the file and write a modified version
    os.system("rm " + html_file)
    with open(html_file, "w") as f:
        f.write(html)
        f.close()


def use_compiled_js(quiet=False):
    js_compilation.compile_js(quiet)
    for h in HTML_FILES:
        link_to_compiled_js_in_html(h)


# Returns whether the operation was a success.
def backup_pristine_files():
    success = True
    for h in HTML_FILES:
        success &= os.system("cp " + h + " " + h + ".orig") == 0
    return success


# Returns whether the operation was a success.
def restore_pristine_files():
    success = True
    for h in HTML_FILES:
        success &= os.system("mv " + h + ".orig " + h) == 0
    return success


def copy_contents(target_path, quiet=False):
    success = True
    if not quiet:
        print("Copying new version into '" + target_path + "'...")
    # TODO: Use 'rsync' if it's available.
    success &= (os.system("rm -rf " + target_path + "/*") == 0)

    to_copy = []
    for f in INCLUDE_LIST:
        if "/" in f:
            parents = f.split("/")[:-1]
            for p in parents:
                if not os.path.exists(os.path.join(target_path, p)):
                    os.mkdir(os.path.join(target_path, p))
        if "*" not in f:
            to_copy.append([f, os.path.join(target_path, f)])
        else:
            to_copy += [[p, os.path.join(target_path, p)] for p in glob.glob(f)]

    for pair in to_copy:
        cmd = "cp -a " + pair[0] + " " + pair[1]
        success &= (os.system(cmd) == 0)

    return success

def replace_string_in_dest_file(to_replace, replacement,
                                target_path, relative_path):
    full_path = os.path.join(target_path, relative_path)
    with open(full_path) as f:
        contents = f.read()
        f.close()
    contents = contents.replace(to_replace, replacement)
    with open(full_path, "w") as f:
        f.write(contents)
        f.close()
    return True

def deploy(disease_id, target_path, quiet=False):
    if not check_dependencies():
        sys.exit(1)

    success = True
    success &= backup_pristine_files()
    success &= (os.system("sass css/styles.scss css/styles.css") == 0)

    use_compiled_js(quiet=quiet)
    insert_analytics_code(quiet=quiet)

    success &= data_util.make_country_pages()

    success &= copy_contents(target_path, quiet=quiet)
    success &= restore_pristine_files()
    success != replace_string_in_dest_file(
        "{{DATA_SRC_URL}}",
        CONFIG[disease_id]["data_src_url"],
        target_path, "js/bundle.js")
    success != replace_string_in_dest_file(
        "{{TITLE}}", CONFIG[disease_id]["name"],
        target_path, "js/bundle.js")
    success != replace_string_in_dest_file(
        "{{MAPBOX_API_TOKEN}}",
        MAPBOX_PROD_API_TOKEN, target_path, "js/bundle.js")
    success != replace_string_in_dest_file(
        "{{OTHER_DISEASES}}",
        ",".join(CONFIG[disease_id]["linkto"]), target_path, "js/bundle.js")

    if success:
        if not quiet:
            print(Fore.GREEN + "All done. " + Style.RESET_ALL + ""
                  "You can test it out with: "
                  "cd " + target_path + " && python3 -m http.server")
    else:
        print(Fore.RED + "Something went wrong." + Style.RESET_ALL)
