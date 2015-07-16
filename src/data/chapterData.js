var _ = require('underscore');
var anims = require('./chapterAnims.json');

var chapters = [
	{
		"id": "ch1",
		"anim": "anim1",
		"html": require("../html/chapter1.html")
	},
	{
		"id": "ch2",
		"anim": "anim2",
		"html": require("../html/chapter2.html")
	},
	{
		"id": "ch3",
		"anim": "anim3",
		"html": require("../html/chapter3.html")
	},
	{
		"id": "ch4",
		"anim": "anim4",
		"html": require("../html/chapter4.html")
	}
];

var parsedAnims = _.mapObject(anims.remembered, function(item, key) {
	var params = {
		duration: item[0].duration,
		targets: {}
	};
	params.targets['camera.position'] = item[1];
	params.targets['camera.rotation'] = item[2];
	params.targets['ref.meshMount.material'] = item[3];
	params.targets['ref.contourLines.material'] = item[4];
	params.targets['ref.gpsLines.material'] = item[5];
	params.targets['scene.scale'] = item[6];
	params.targets['ref.bends.material'] = item[7];

	return params;
});

var parsedChapters = chapters.map(function(chapter) {
	chapter.anim = parsedAnims[chapter.anim];
	return chapter;
})

module.exports = parsedChapters;
