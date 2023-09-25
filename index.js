const axios = require("axios");
const xml2js = require("xml2js");
const fs = require('fs');
const parser = new xml2js.Parser({ attrkey: "ATTR" });
const xmlFilePath = process.argv[2];

if (!xmlFilePath) {
    console.error("pom.xml path is required");
    process.exit(1);
}

// read xml file
const xml = fs.readFileSync(xmlFilePath, 'utf8');

// check dependency
parser.parseString(xml, async function (error, result) {
    if (error) {
        console.log(error);
    }

    // get single dependency
    let dependencies = result.project.dependencies[0].dependency;
    // check if it is available on maven API
    for (let dependency of dependencies) {
        checkDependencyAvailability(dependency);
    }
});



// make the http request to maven API
// e.g https://search.maven.org/solrsearch/select?q=g:ch.qos.logback%20AND%20v:1.0.7%20a:logback-classic&rows=20&wt=json&sort=version
function checkDependencyAvailability(dependency) {
    axios.get("https://search.maven.org/solrsearch/select?q=g:" + dependency.groupId + "%20AND%20v:" + dependency.version[0] + "%20a:" + dependency.artifact + "&rows=1&wt=json")
        .then(function (response) {
            // dependency not available on maven central
            if (response &&
                response.data &&
                response.data.response.numFound === 0) {
                console.log(dependency;
            }
        }).catch(function (error) {
            // handle error
            console.log(error);
        });
}
