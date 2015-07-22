var _ = require('underscore');
var anims = require('./chapterAnims.json');

var chapters = [
	{
		"id": "intro",
		"anim": "intro",
		"image": "/imgs/intro.jpg",
		"html": require("../html/intro.html")
	},
	{
		"id": "ch0",
		"anim": "ch0",
		"image": "/imgs/ch0.jpg",
		"html": require("../html/chapter0.html")
	},
	{
		"id": "ch1a",
		"anim": "ch1a",
		"image": "/imgs/ch1a.png",
		"html": require("../html/chapter1a.html")
	},
	{
		"id": "ch1b",
		"anim": "ch1b",
		"image": "/imgs/ch1b.jpg",
		"duration": 0,
		"html": require("../html/chapter1b.html")
	},
	{
		"id": "ch2a",
		"anim": "ch2",
		"image": "/imgs/ch2a.jpg",
		"html": require("../html/chapter2a.html")
	},
	{
		"id": "ch2b",
		"duration": 0,
		"image": "/imgs/ch2a.jpg",
		"anim": "ch2",
		"html": require("../html/chapter2b.html")
	},
	{
		"id": "ch3a",
		"anim": "ch3",
		"image": "/imgs/ch3a.jpg",
		"html": require("../html/chapter3a.html")
	},
	{
		"id": "ch3b",
		"duration": 0,
		"anim": "ch3",
		"image": "/imgs/ch3a.jpg",
		"html": require("../html/chapter3b.html")
	},
	{
		"id": "ch4a",
		"anim": "ch4",
		"image": "/imgs/ch4a.jpg",
		"html": require("../html/chapter4a.html")
	},
	{
		"id": "ch4b",
		"duration": 0,
		"anim": "ch4",
		"image": "/imgs/ch4a.jpg",
		"html": require("../html/chapter4b.html")
	},
	{
		"id": "ch5a",
		"anim": "ch5a",
		"image": "/imgs/ch5a.jpg",
		"html": require("../html/chapter5a.html")
	},
	{
		"id": "ch5b",
		"duration": 0,
		"anim": "ch5b",
		"image": "/imgs/ch5b.jpg",
		"html": require("../html/chapter5b.html")
	},
	{
		"id": "ch6",
		"anim": "ch6",
		"image": "/imgs/ch6.jpg",
		"html": require("../html/chapter6.html")
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
	params.targets['labelsEl.style'] = item[8];
	params.targets['ref.meshMount.position'] = item[9];
	params.targets['ref.poi1.material'] = item[10];

	return params;
});

var parsedChapters = chapters.map(function(chapter) {
	chapter.anim = parsedAnims[chapter.anim];
	return chapter;
})

module.exports = parsedChapters;
