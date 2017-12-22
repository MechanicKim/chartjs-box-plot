var Boxplot = {
	chart: null,
	data: [],

	backgroundColor: [
		'rgba(255, 170, 0, 1)',
		'rgba(75, 192, 192, 1)',
	],

	barColor: 'rgba(201, 203, 207, 1)',
	dotColor: 'rgba(201, 203, 207, 1)',

	q2LineColor: 'rgba(54, 162, 235, 1)',

	custom: Chart.controllers.bar.extend({
		draw: function(ease) {
			var ctx = this.chart.chart.ctx;
			var meta = this.getMeta();
			var idx = meta.data[0]._datasetIndex;
			var length = meta.data.length;

			if (idx === 1 || idx === 4) {
				ctx.save();
				meta.data.forEach(function(v, i) {
					var x = v._view.x;
					var y = v._view.y;
					var base = v._view.base;

					ctx.beginPath();
					ctx.moveTo(x, base);
					ctx.lineTo(x, y);
					ctx.strokeStyle = Boxplot.barColor;
					ctx.lineWidth = 3;
					ctx.stroke();

					ctx.beginPath();
					if (idx === 1) ctx.arc(x, base, 3, 0, 2 * Math.PI);
					else ctx.arc(x, y, 3, 0, 2 * Math.PI);
					ctx.fillStyle = Boxplot.dotColor;
					ctx.fill();
					ctx.stroke();
				});
				ctx.restore();
			}

			if (idx === 2) {
				ctx.save();
				meta.data.forEach(function(v, i) {
					var x = v._view.x;
					var y = v._view.y;
					var width = v._view.width;

					ctx.beginPath();
					ctx.moveTo(x - width / 2, y);
					ctx.lineTo(x + width / 2, y);
					ctx.lineWidth = 1;
					ctx.strokeStyle = Boxplot.q2LineColor;
					ctx.stroke();
				});
				ctx.restore();
			}

			Chart.controllers.bar.prototype.draw.call(this, ease);
		}
	}),

	createDataset: function(colorIndex, data) {
		var backgroundColor = 'rgba(255, 255, 255, 0)';
		if (colorIndex === 2 || colorIndex === 3) {
			backgroundColor = Boxplot.backgroundColor;
		}

		return {
			backgroundColor: backgroundColor,
			data: data
		};
	},

	update: function() {
		var max = 0;
		Boxplot.data.forEach(function(d, i) {
			Boxplot.chart.data.datasets[i].data[0] = d.MIN;
			Boxplot.chart.data.datasets[i].data[1] = d.Q1 - d.MIN;
			Boxplot.chart.data.datasets[i].data[2] = d.Q2 - d.Q1;
			Boxplot.chart.data.datasets[i].data[3] = d.Q3 - d.Q2;
			Boxplot.chart.data.datasets[i].data[4] = d.MAX - d.Q3;

			max = max < d.MAX ? d.MAX : max;
		});

		Boxplot.chart.options.scales.yAxes.ticks.max = max * 0.1;

		Boxplot.chart.update();
	},

	print: function(canvasID, data, labels) {
		Boxplot.data = data.slice();

		if (Boxplot.chart && Boxplot.chart.data) {
			Boxplot.update();
			return;
		}

		var max = 0;
		var datasets = [];
		var datasetData = [ [], [], [], [], [] ];
		Boxplot.data.forEach(function(d, i) {
			datasetData[0].push(d.MIN);
			datasetData[1].push(d.Q1 - d.MIN);
			datasetData[2].push(d.Q2 - d.Q1);
			datasetData[3].push(d.Q3 - d.Q2);
			datasetData[4].push(d.MAX - d.Q3);

			max = max < d.MAX ? d.MAX : max;
		});

		for (var i = 0; i < 5; i++) {
			datasets.push(Boxplot.createDataset(i, datasetData[i]));
		}

		Chart.defaults.Boxplot = Chart.defaults.bar;
		Chart.controllers.Boxplot = Boxplot.custom;

		var ctx = document.getElementById(canvasID).getContext('2d');
		Boxplot.chart = new Chart(ctx, {
			type: 'Boxplot',
	    data: {
	      labels: labels,
	      datasets: datasets
	    },
	    options: {
				maintainAspectRatio: false,
				title:{ display:false },
	      legend: { display: false },
	      tooltips: {
	        mode: 'point',
	        custom: function(tooltip) {
	          if (!tooltip.dataPoints) return;

	          var idx = tooltip.dataPoints[0].datasetIndex;
	          if (idx === 0) {
	            tooltip.opacity = 0;
	          }
	        },
					callbacks: {
	          title: function(tooltip, chart) {
							var datasetIndex = tooltip[0].datasetIndex;
							var dataIndex = tooltip[0].index;
							var data = Boxplot.data[dataIndex];

							if (datasetIndex === 1) {
								return [
									'25% : ' + data.Q1,
									'최소 : ' + data.MIN
								];
							} else if (datasetIndex === 2 || datasetIndex === 3) {
								return [
									'75% : ' + data.Q3,
									'중앙값 : ' + data.Q2,
									'25% : ' + data.Q1,
								];
							} else if (datasetIndex === 4) {
								return [
									'최대 : ' + data.MAX,
									'75% : ' + data.Q3
								];
							}

	            return '';
	          },
	          label: function(tooltip, chart) {
							return '';
	          }
	        }
	      },
	      responsive: false,
	      scales: {
	        xAxes: [
						{
							gridLines: { display:false },
							barPercentage: 0.7,
		          stacked: true,
		        }
					],
	        yAxes: [
						{
							gridLines: {
								display:false,
								drawBorder: false
							},
							ticks: {
								max: max + (max * 0.1),
								min: 0,
								display: false
							},
		          stacked: true
	        	}
					]
	      }
	    }
		});
	}
};
