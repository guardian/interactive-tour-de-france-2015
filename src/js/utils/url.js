// http://stackoverflow.com/a/5158301
function getParameterByName(name) {
    return urlParams[name];
}

function hasParameter(name) {
    return name in urlParams;
}

var urlParams;
(window.onpopstate = function () {
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query))
       urlParams[decode(match[1])] = decode(match[2]);
})();

module.exports = {
	hasParameter: hasParameter,
	getParameterByName: getParameterByName
};
