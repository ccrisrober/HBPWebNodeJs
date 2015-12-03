/* global app:true */

(function() {
	'use strict';

	$('.nav-tabs a').click(function (e) {
		//alert($(this).data("table"));
		updateContainer($(this).data("table"));
	});
	function updateContainer(table) {
		$("#container").highcharts({
			data: {
				table: document.getElementById(table)
			},
			chart: {
				polar: true,
				type: 'line'
			},
			title: {
				text: "Data extracted from a HTML table in a page"
			},
			pane: {
				size: '80%'
			}
			,xAxis: {
				categories: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47],
				tickmarkPlacement: 'on',
				lineWidth: 0
			},
			yAxis: {
				gridLineInterpolation: 'polygon',
				allowDecimals: false,
				title: {
					text: "Units"
				}
			},
			tooltip: {
				shared: true,
				pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y}</b><br/>'
			},

			legend: {
				align: 'right',
				verticalAlign: 'top',
				y: 70,
				layout: 'vertical'
			}
		})
	};
	
	updateContainer("table-0");
}());