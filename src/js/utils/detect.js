
/*
    Module: detect/detect.js

	Original: https://github.com/guardian/frontend/blob/master/static/src/javascripts/projects/common/utils/detect.js

    Description: Used to detect various characteristics of the current browsing environment.
                 layout mode, connection speed, battery level, etc...
*/
/* jshint ignore:start */

function getViewport() {
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0];

    return {
        width:  w.innerWidth  || e.clientWidth  || g.clientWidth,
        height: w.innerHeight || e.clientHeight || g.clientHeight
    };
}


module.exports = {
    getViewport: getViewport
};
