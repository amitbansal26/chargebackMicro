
var colors = [

"#00ffff", "#f0ffff", "#f5f5dc", "#000000", "#0000ff", "#a52a2a", "#00ffff",
		"#00008b", "#008b8b", "#a9a9a9", "#006400", "#bdb76b", "#8b008b",
		"#556b2f", "#ff8c00", "#9932cc", "#8b0000", "#e9967a", "#9400d3",
		"#ff00ff", "#ffd700", "#008000", "#4b0082", "#f0e68c", "#add8e6",
		"#e0ffff", "#90ee90", "#d3d3d3", "#ffb6c1", "#ffffe0", "#00ff00",
		"#ff00ff", "#800000", "#000080", "#808000", "#ffa500", "#ffc0cb",
		"#800080", "#800080", "#ff0000", "#c0c0c0", "#ffffff", "#ffff00" ];

var memoryConv=["B","KB","MB","GB","TB" ];
var memoryFig=[1024,1048576];


/* Created temporary array for organization which is hard cored once data is server side code is ready to fetch data from metrics this line should be deleted.*/
var tempOrgArray=["CapGem", "Coke","Nex"];
var tempSpaceArray=["dev", "QA","Prod"];
var getcolorArray = function(labeList) {
	var ids = [];
	var colorArray = [];
	for (var i = 0; i < colors.length; ++i) {
		ids.push(colors[i]);
	}
	for (var i = 0; i < labeList.length; i++) {
		var random = Math.round(Math.random() * ids.length);
		var color = ids.splice(random, 1);
		colorArray.push(color[0])
	}
	console.log(colorArray);
	return colorArray;
}
var getMemoryUsageDetails = function() {

	$.ajax({
		url : "getDetails",
		success : function(data) {
			populateChartDetails(data, "memory");
		}
	});

}

/*Getting Unused Memory Details*/
var getUnusedDetails = function() {

	$.ajax({
		url : "getUnusedDetails",
		success : function(data) {
			populateChartDetails(data, "unusedMemory");
		}
	});

}
var getCPUUsageDetails = function() {

	$.ajax({
		url : "getCPUUsage",
		success : function(data) {
			populateChartDetails(data, "cpu");
		}
	});

}

var getFreeCPUUsageDetails = function() {

	$.ajax({
		url : "getFreeCPUDetails",
		success : function(data) {
			populateChartDetails(data, "freeCPU");
		}
	});

}
/* Getting CPU Usage*/

/* Getting Disk Usage*/
var getDiskUsageDetails = function() {
	$.ajax({
		url : "getDiskUsage",
		success : function(data) {
			populateChartDetails(data, "disk");
		}
	});

}

var getOrganizations = function() {
	$.ajax({
		url : "getOrganizations",
		success : function(data) {
			getDropDownList("OrgSelect",tempOrgArray)
			
		},
	
		
	});

}

var getSpace = function() {
	$.ajax({
		url : "getSpace",
		success : function(data) {
			getDropDownList("OrgSpace",tempSpaceArray);
			
		},
		
	});

}



/* Utility function to create a String Array*/

var getlabelsArray = function(labeList) {
	var labelsArray = [];
	for (var i = 0; i < labeList.length; i++) {
		labelsArray.push(labeList[i]);
	}
	return labelsArray;
};

/* Utility Function to create an Integer Array*/

var getdataArray = function(data) {
	var dataArray = [];
	for (var i = 0; i < data.length; i++) {
		dataArray.push(parseFloat(data[i]));
	}
	return dataArray;
};

/* Function to populate chart Details */
var populateChartDetails = function(data, id) {
	var canvasId = document.getElementById(id);
	var colorArray = getcolorArray(data.label);
	var chartData = {
		labels : getlabelsArray(data.label),
		datasets : [ {
			data : getdataArray(data.data),
			backgroundColor : colorArray,
			hoverBackgroundColor : colorArray
		} ]
	};
	
	var ctx = canvasId.getContext("2d");
	var midX = canvasId.width / 2;
	var midY = canvasId.height / 2;
	var totalValue = getTotalValue(data.data);
console.log(chartData);

	var pieChart = new Chart(canvasId, {
		type : 'pie',
		data : chartData,
		options : {
			responsive : false,
			//onAnimationProgress:  drawSegmentValues,
				tooltips : {
				callbacks : {
					label : function(tooltipItem, data) {
						var dataset = data.datasets[tooltipItem.datasetIndex];
						var total = dataset.data.reduce(function(previousValue,
								currentValue, currentIndex, array) {
							return previousValue + currentValue;
						});
						var currentValue = dataset.data[tooltipItem.index];
						var returnElement;
						if(!id.toUpperCase().includes("CPU")){
							if(currentValue>=  memoryFig[1]){
								return ((currentValue/parseInt(memoryFig[1])).toFixed(2) + memoryConv[2]);
							}else if(currentValue>=memoryFig[0] && currentValue<  memoryFig[1] ){
								return (currentValue + memoryConv[1]);
							}else if(currentValue<memoryFig[0]){
								return (currentValue + memoryConv[0]);
							} 
						}else{
							var precentage = Math.floor(((currentValue / total) * 100) + 0.5);
							return precentage + "%";
						}
						
					}
				}
			}

		}
	});

	var radius = pieChart.outerRadius;

	function drawSegmentValues() {

		for (var i = 0; i < pieChart.segments.length; i++) {
			ctx.fillStyle = "white";
			var textSize = canvasId.width / 15;
			ctx.font = textSize + "px Verdana";
			// Get needed variables
			var value = pieChart.segments[i].value / totalValue * 100;
			if (Math.round(value) !== value)
				value = (pieChart.segments[i].value / totalValue * 100)
						.toFixed(1);
			value = value + '%';

			var startAngle = pieChart.segments[i].startAngle;
			var endAngle = pieChart.segments[i].endAngle;
			var middleAngle = startAngle + ((endAngle - startAngle) / 2);

			// Compute text location
			var posX = (radius / 2) * Math.cos(middleAngle) + midX;
			var posY = (radius / 2) * Math.sin(middleAngle) + midY;

			// Text offside by middle
			var w_offset = ctx.measureText(value).width / 2;
			var h_offset = textSize / 4;

			ctx.fillText(value, posX - w_offset, posY + h_offset);
		}

	}
	/*End of draw Segment*/
}

function getTotalValue(arr) {
	var total = 0;
	for (var i = 0; i < arr.length; i++)
		total += arr[i];
	return total;
}



function getDropDownList( id, optionList) {
	
		var selectElement= document.getElementById(id);
		for (var i = 0; i<=optionList.length-1; i++){
		    var opt = document.createElement('option');
		    opt.value = optionList[i];
		    opt.innerHTML = optionList[i];
		    selectElement.appendChild(opt);
		}
}
function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
  //  var tab = document.getElementsByName(tabName);
    document.getElementById(tabName).style.visibility  = 'visible';
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
    	alert(tablinks[i].className = tablinks[i].className);
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}