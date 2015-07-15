require('classlist-polyfill');

function createDot(count) {
	var el = document.createElement('div');
	el.classList.add('gv-pagination-dot');
	return el;
}

var Pagination = function(pageCount) {
	this.pageCount = pageCount;
	this.currentPage = 0;
	this.el = document.createElement('div');
	this.el.classList.add('gv-pagination');

	this.pages = [];
	for (var i = 0; i < this.pageCount; i++) {
		var dotEl = createDot(i);
		this.el.appendChild(dotEl);
		this.pages.push(dotEl);
	}
}

Pagination.prototype.goTo = function(index) {
	this.currentPage = index;
	this.pages.forEach(function(el) {
		el.classList.remove('active');
	});

	this.pages[index].classList.add('active');
}

module.exports = Pagination;