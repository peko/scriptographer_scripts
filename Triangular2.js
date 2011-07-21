// Known bugs:
// Removing lines when there are only one or two triangles removes the polygon group.

var colorSets = {
	'Icy': ['E1F2F7', '89BECE', '4F8B98', '0A3F47'],
	'Citrus': ['FFDA17', 'EC6227', '6D1F08', '6D1F08'],
	'White to Black': ['FBFBFB', 'ADADAD', '39393A', '000000'],
	'Red Blue Yellow Purple': ['E30613', '602483', 'B5DEE4', 'FFE600'],
	'Eye Candy': ['098e7b', 'fdb606', 'd40144', 'fb4810'],
	'Fourties Lipstick': ['0d061c', 'be1900', '1e1c2c', '720a00'],
	'Colorful Mess': ['0fe1fa', 'f0ff00', '009bf7', 'ff4001'],
	'Plum': ['786262', 'b8988b', 'ebc8ad', '434a4c'],
	'Green': ['044c29', '45bf55', '167f39', '96ed89'],
	'Purple Cream': ['fee293', '380c2a', 'a6243d', 'e85400'],
	'Orange Brown': ['520026', '822a21', 'fc9851', 'c2410a'],
	'Green Gold': ['a99000', 'fffb8d', '298737', '005737'],
	'Revolution': ['5f020d', '9c0413', 'd9cda9', '0d0000']
};

var colorSetNames = [];
colorSets.each(function(colorSet, i) {
	colorSetNames.push(i);
});

var activeColorSet = colorSets[colorSetNames.first];

function onMouseDown(event) {
	structure.onMouseDown(event);
}

function onMouseDrag(event) {
	structure.onMouseDrag(event);
}

function onMouseUp(event) {
	structure.onMouseUp(event);
}

var values = {
	maxDistance: 100
}

var components = {
	/*
	colorset: {
		type: 'list', label: 'Color Set',
		options: colorSetNames,
		onChange: function(value) {
			activeColorSet = colorSets[value];
			structure.polygons.each(function(polygon) {
				polygon.colorize();
			});
		}
	},
	*/
	maxDistance: {
		label: 'Maximum Distance',
		steppers: true,
		increment: 50,
		units: 'point'
	},
	menuEntry: { 
		type: 'menu-entry',
		value: 'Initialize With Selected',
		onSelect: function() {
			var selectedGroups = document.getItems({
				type: Group,
				selected: true
			});
			var structureGroup;
			for(var i = 0; i < selectedGroups.length; i++) {
				var selectedGroup = selectedGroups[i];
				if(selectedGroup.name == 'Triangular')
					structureGroup = selectedGroup;
			}
			if(structureGroup) {
				structure = new Structure(structureGroup);
				structureGroup.selected = false;
			} else {
				Dialog.alert('Please select a Triangular group first');
			}
		}
	}
};

var palette = new Palette('Triangular', components, values);

Structure = Base.extend({
	initialize: function(group) {
		this.lines = [];
		this.lastLines = [];
		this.maxDistance = 20;
		this.polygons = {};

		if(!group) {
			this.group = new Group();
			this.group.name = 'Triangular';
			this._id = Math.floor(Math.random() * 10000);
			this.group.data._id = this._id;
			this.lineGroup = new Group();
			this.lineGroup.name = 'Lines';
			this.lineGroup.visible = false;
			this.group.appendTop(this.lineGroup);

			this.polygonGroup = new Group();
			this.polygonGroup.name = 'Polygons';
			this.group.appendTop(this.polygonGroup);
			
			this.path = new Path();
			this.path.fillColor = null;
			this.path.strokeColor = new GrayColor(1);
			this.path.strokeWidth = 1;
			this.path.name = 'data';
			this.path.visible = false;
			this.group.appendTop(this.path);
		} else {
			this.group = group;
			this._id = this.group.data._id;
			this.lineGroup = group.children['Lines'];
			this.polygonGroup = group.children['Polygons'];
			this.path = group.children['data'];
			this.rebuild();
		}
	},
	
	onMouseDrag: function(event) {
		this.lastLines.each(function(line) {
			if(line.path)
				line.path.remove();
		});
		this.lastLines = [];
		if(!Key.isDown('shift')) {
			this.path.segments.pop();
			// this.points.pop();
			this.addPoint(event.point);
		}
	},
	
	onMouseDown: function(event) {
		this.checkValidity();

		this.lines = [];
		this.lineGroup.children.each(function(linePath) {
			this.lines.push(new Line(linePath));
		}, this);
		this.points = [];
		this.path.segments.each(function(segment) {
			this.points.push(segment.point);
		}, this);

		this.lineGroup.selected = true;
		this.showPoints();
		var newPoint = event.point;
		this.lineGroup.visible = true;
		var hitResult = this.lineGroup.hitTest(event.point);
		if(hitResult) {
			// if we hit an anchor, remove that point
			if(hitResult.type == 'anchor') {
				var found = false;
				newPoint = hitResult.point;
				this.removePoint(newPoint);
			} else {
				// if we hit a line, remove it first
				var item = hitResult.item;
				if(item instanceof Path && item.isParent(this.lineGroup)) {
					newPoint = hitResult.point;
					this.removeLine(new Line(item));
				}
			}
		}
		// if shift is down don't add a point
		if(!Key.isDown('shift')) {
			this.addPoint(newPoint);
		}
	},
	
	onMouseUp: function(event) {
		this.lineGroup.visible = false;
		this.hidePoints();
		this.lineGroup.selected = false;
		this.addLastLines();
		this.createPolygons();
	},
	
	checkValidity: function() {
		var valid = true;
		if(!this.group.isValid()) {
			var groups = document.getItems({
				type: Group
			});
			var triGroup;
			groups.each(function(group) {
				if(group.name && group.name == 'Triangular' && group.data._id == this._id) {
					triGroup = group;
				}
			}, this);

			this.initialize(triGroup);
			// print('recreating everything');
			return
		}
		if(this.lineGroup.isValid()) {
			for(var i = 0, l = this.lines.length; i < l; i++) {
				var line = this.lines[i];
				if(!line.getPath().isValid()) {
					i = l;
					this.rebuild();
				}
			}
		} else {
			print('group is invalid');
		}
	},
	
	showPoints: function() {
		this.pointsPreview = new Layer();
		this.pointsPreview.color = 'black';
		var size = 2 / document.activeView.zoom;
		for(var i = 0, l = this.path.segments.length; i < l; i++) {
			this.pointsPreview.appendChild(new Path.Circle(this.path.segments[i].point, size));
		}
	},
	
	hidePoints: function() {
		if(this.pointsPreview && this.pointsPreview.isValid()) {
			this.pointsPreview.remove();
		}
	},
	
	rebuild: function() {
		this.rebuildLines();
		this.rebuildPolygons();
	},
	
	rebuildLines: function() {
		this.lines = [];
		var children = this.lineGroup.children;
		for(var j = 0, l = children.length; j < l; j++) {
			var linePath = children[j];
			if(linePath.name == 'line') {
				if(linePath.segments.length == 2) {
					var line = new Line(linePath);
					this.lines.push(line);
				} else {
					linePath.remove();
				}
			}
		}
	},
	
	rebuildPolygons: function() {
		this.polygons = {};
		this.polygonGroup.children.each(function(polyGroup) {
			var polygon = new Polygon(polyGroup);
			this.polygons[polygon.getHash()] = polygon;
		}, this);
	},
	
	createPolygons: function() {
		var polygonizer = new Polygonizer();
		polygonizer.add(this.lines);
		var polys = polygonizer.getPolygons();
		var path;
		if(polys) {
			for(var i = 0; i < polys.length; i++ ) {
				var poly = polys[i];
				var polygon = new Polygon(poly);
				if(!polygon.exists()) {
					path = polygon.getPath();
					this.polygonGroup.appendTop(polygon.group);
					path.data.exists = true;
					this.polygons[polygon.getHash()] = polygon;
				} else {
					path = this.polygons[polygon.getHash()].path;
					path.data.exists = true;
				}
			}
			this.removeUnusedPolygons();
			this.polygons.each(function(polygon) {
				if(!polygon.fillColor)
					polygon.colorize();
			});
		}
	},
	
	removeUnusedPolygons: function() {
		for(var i in this.polygons) {
			var polygon = this.polygons[i];
			var path = polygon.path;
			if(path.data.exists) {
				path.data.exists = false;
			} else {
				polygon.group.remove();
				delete this.polygons[i];
			}
		}
	},
	
	removeLine: function(toRemove) {
		for(var i = 0, l = this.lines.length; i < l; i++) {
			var line = this.lines[i];
			if(line.equals(toRemove)) {
				this.lines.splice(i, 1);
				line.path && line.path.remove();
				i = l;
			}
		}
	},
	
	removePoint: function(toRemove) {
		for(var i = this.lines.length; i != 0; i--) {
			var line = this.lines[i - 1];
			if(line.hasPoint(toRemove)) {
				line.path && line.path.remove();
				this.lines.splice(i - 1, 1);
				found = true;
			}
		}
		if(found) {
			for(var i = 0, l = this.path.segments.length; i < l; i++) {
				var segment = this.path.segments[i];
				if(segment.point == toRemove) {
					this.path.segments.splice(i, 1);
					i = l;
				}
			}
		}
	},
	
	addLastLines: function() {
		this.lastLines.each(function(line) {
			this.lines.push(line);
		}, this);
		this.lastLines = [];
	},
	
	addPoint: function(newPoint) {
		this.path.add(newPoint);
		var path = this.path;
		var line = new Line(newPoint, newPoint);
		for(var j = 0; j < path.segments.length; j++) {
			var segment = path.segments[j];
			var point = segment.point;
			var delta = point - newPoint;
			if(delta.length > 0 && delta.length < values.maxDistance) {
				line.initialize(newPoint, point);
				var crosses = false;
				for(var k = 0, l = this.lines.length; k < l; k++) {
					var oldLine = this.lines[k];
					if(oldLine.intersects(line)) {
						crosses = true;
						k = l;
					}
				}
				if(!crosses) {
					this.lastLines.push(new Line(newPoint, point));
				}
			}
		}
		this.lastLines.each(function(line) {
			var path = line.getPath();
			this.lineGroup.appendTop(path);
		}, this);
	}
});

Polygon = Base.extend({
	initialize: function(points) {
		this.lines = [];
		this.points = [];
		if(points instanceof Group) {
			this.group = points;
			this.path = this.group.children['polyPath'];
			this.fillColor = this.path.data.fillColor;
			for(var i = 0, l = this.path.segments.length; i < l; i++) {
				var segment = this.path.segments[i];
				this.points.push(segment.point);
			}
		} else {
			this.points = [];
			for(var i = 0, l = points.length; i < l; i++) {
				if(i % 2)
					this.points.push(points[i]);
			}
		}
		for(var i = 0, l = this.points.length; i < l; i++) {
			var point = this.points[i];
			var nextPoint = this.points[i + 1 < this.points.length ? i + 1 : 0];
			this.lines.push([point, nextPoint]);
		}
	},
	
	exists: function() {
		return !!structure.polygons[this.getHash()];
	},
	
	getPath: function() {
		this.path = new Path();
		this.path.strokeColor = null;
		this.path.fillColor = null;
		this.path.closed = true;
		this.path.name = 'polyPath';
		this.path.data.hash = this.getHash();
		for(var j = 0, l = this.points.length; j < l; j++) {
			var point = this.points[j];
			this.path.add(point);
		}
		
		this.group = new Group();
		this.group.name = 'polygon';
		this.group.appendTop(this.path);
		/*
		var center = this.getInCenter();
		if(center) {
			var clone = this.path.clone();
			clone.scale(0.5, center);
			clone.name = 'inside';
			this.group.appendTop(clone);
			
			var clone = clone.clone();
			clone.name = 'shadow';
			var delta = clone.segments[1].point - clone.segments[0].point;
			delta.length = Math.random() * delta.length / 2 + (delta.length * 0.1);
			clone.segments[1].point = clone.segments[0].point + delta;
		}
		*/
		return this.path;
	},
	
	getInCenter: function() {
		if(!this.center) {
			if(this.points.length == 3) {
				var lines = [];
				for(var i = 0, l = this.points.length; i < l; i++) {
					var point = this.points[i];
					var prevPoint = i == 0 ? this.points[l - 1] : this.points[i - 1];
					var nextPoint = i == l - 1 ? this.points[0] : this.points[i + 1];
					var delta1 = nextPoint - point;
					var delta2 = prevPoint - point;
					delta2.angle = (delta1.angle + delta2.angle) / 2;
					lines.push(new Line(point, point + delta2, true));
				}
				this.center = lines[0].getIntersectionPoint(lines[1]);
			}
		}
		return this.center;
	},
	
	getHash: function() {
		if(!this.hash) {
			if(this.path) {
				this.hash = this.path.data.hash;
			} else {
				var sum = new Point();
				for(var i = 0, l = this.points.length; i < l; i++) {
					sum += this.points[i];
				}
				sum = (sum * 10000).floor();
				this.hash = sum.x + '' + sum.y;
			}
		}
		return this.hash;
	},
	
	findShared: function(mLine) {
		for(var i in structure.polygons) {
			var polygon = structure.polygons[i];
			if(polygon.getHash() != this.getHash()) {
				var found = false;
				for(var j = 0; j < polygon.lines.length; j++) {
					var line = polygon.lines[j];
					if((line[0] == mLine[0] && line[1] == mLine[1]) || (line[1] == mLine[0] && line[0] == mLine[1])) {
						return polygon;
					}
				}
			}
		}
	},
	
	colorize: function() {
		
		rasters = document.getItems({
			type: [Raster, PlacedFile],
			selected: true
		});
		 
		if (!rasters) { Dialog.alert("Select one raster"); return };
		
		var c = rasters[0].getAverageColor(this.path);
		var c1 = c.clone();
		var c2 = c.clone();
		c1.red   *= 0.75;
		c1.green *= 0.75;
		c1.blue  *= 0.75;
		c2.red   *= 1.1;
		c2.green *= 1.1;
		c2.blue  *= 1.1;
		var bounds = this.path.bounds; 
		var gr = new Gradient() { type: 'radial', stops: [ new GradientStop(c2, 0.0), new GradientStop(c1, 1.0)]};
		this.path.fillColor = new GradientColor(gr, bounds.bottomRight, bounds.topLeft);
		
		/*
		var colors = {};
		var intersects = false;
		var colorSet = activeColorSet;
		for(var i = 0; i < 4; i++) {
			colors[colorSet[i]] = {
				found: false
			}
		}
		var takenColors = [];
		for(var i = 0; i < this.lines.length; i++) {
			var sPolygon = this.findShared(this.lines[i]);
			if(sPolygon && sPolygon.fillColor) {
				if(colors[sPolygon.fillColor])
					colors[sPolygon.fillColor].found = true;
			}
		}
		var selected = false;
		var colorsArray = [];
		for(var i in colors) {
			colors[i].color = i;
			colorsArray.push(colors[i]);
		}
		colorsArray = colorsArray.shuffle();
		for(var i = 0; i < colorsArray.length; i++) {
			if(!colorsArray[i].found) {
				var color = colorsArray[i].color;
				this.path.fillColor = '#' + color;
				var index = i + 2 >= colorsArray.length ? (i + 2) % colorsArray.length : i + 2;
				this.group.children[0].fillColor = colorsArray[index].color;
				if(this.group.children.length >= 2) {
					var index = i + 1 == colorsArray.length ? 0 : i + 1;
					this.group.children[1].fillColor = colorsArray[index].color;
				}
				this.fillColor = color;
				this.path.data.fillColor = color;
				break;
			}
		}
		*/
	}
});

Line = Base.extend({
	initialize: function(point1, point2, extend) {
		if(point1 instanceof Path) {
			var path = point1;
			this.point1 = path.segments.first.point;
			this.point2 = path.segments.last.point;
			this.path = path;
		} else {
			this.point1 = point1;
			this.point2 = point2;
		}
		this.vector = this.point2 - this.point1;
		var shortV = this.vector.normalize(0.01);
		this.shortVector = this.vector - shortV;
		this.shortPoint1 = this.point1 - shortV;
		// extend controls wether the line extends beyond the defining points,
		// meaning point results outside the line segment are allowed.
		this.extend = extend;
	},

	getPath: function() {
		if(!this.path) {
			this.path = new Path.Line(this.point1, this.point2) {
					strokeColor: null,
					fillColor: null,
					name: 'line'
				};
		}
		return this.path;
	},
	
	intersects: function(line) {
		var v1 = this.shortVector;
		var v2 = line.shortVector;
		var cross = v1.cross(v2);
		// Epsilon tolerance
		if (Math.abs(cross) <= 10e-6)
			return null;
		var v = line.shortPoint1 - this.shortPoint1;
		var t1 = v.cross(v2) / cross;
		var t2 = v.cross(v1) / cross;
		// Check the ranges of t parameters if the line is not allowed to
		// extend beyond the definition points.
		if ((this.extend || 0 <= t1 && t1 <= 1)
				&& (line.extend || 0 <= t2 && t2 <= 1))
			return true;
		return null;
	},
	
	getIntersectionPoint: function(line) {
		var v1 = this.shortVector;
		var v2 = line.shortVector;
		var cross = v1.cross(v2);
		// Epsilon tolerance
		if (Math.abs(cross) <= 10e-6)
			return null;
		var v = line.shortPoint1 - this.shortPoint1;
		var t1 = v.cross(v2) / cross;
		var t2 = v.cross(v1) / cross;
		// Check the ranges of t parameters if the line is not allowed to
		// extend beyond the definition points.
		if ((this.extend || 0 <= t1 && t1 <= 1)
				&& (line.extend || 0 <= t2 && t2 <= 1))
			return this.point1 + v1 * t1;
		return null;
	},

	getSide: function(p) {
		var v1 = this.point2 - this.point1;
		var v2 = p - this.point1;
		var ccw = v2.cross(v1);
		if (ccw == 0.0) {
			ccw = v2.dot(v1);
			if (ccw > 0.0) {
				ccw = (v2 - v1).dot(v1);
				if (ccw < 0.0)
				    ccw = 0.0;
			}
		}
		return ccw < 0.0 ? -1 : ccw > 0.0 ? 1 : 0;
	},

	getVector: function() {
		return this.point2 - this.point1;
	},
	
	equals: function(line) {
		return this.point1 == line.point1 && this.point2 == line.point2;
	},
	
	sharesPoint: function(line) {
		return line.hasPoint(this.point1) || line.hasPoint(this.point2);
	},
	
	hasPoint: function(point) {
		return this.point1 == point || this.point2 == point;
	},
	
	toString: function() {
		return 'Line: point1: ' + this.point1 + ', point2' + this.point2;
	}
});

/*
 * Adapted to Javascript from the JTS Topology Suite by Jonathan Puckey 2010
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 *
 * For more information, contact:
 *
 *	 Vivid Solutions
 *	 Suite #1A
 *	 2328 Government Street
 *	 Victoria BC  V8T 5G5
 *	 Canada
 *
 *	 (250)385-6040
 *	 www.vividsolutions.com
 */

Polygonizer = Base.extend({
	initialize: function() {
		this.dangles = [];
		this.cutEdges = [];
		this.invalidRingLines = [];
		this.holeList = null;
		this.shellList = null;
		this.polyList = null;
	},
	
	add: function(lines) {
		lines.each(function(line) {
			if(!this.graph)
				this.graph = new PolygonizeGraph();
			this.graph.addEdge(line);
		}, this);
	},
	
	getPolygons: function() {
		this.polygonize();
		return this.polyList;
	},
	
	polygonize: function() {
		if(this.polyList != null) return;
		this.polyList = [];
		if(!this.graph) return;
		
		this.dangles = this.graph.deleteDangles();
		this.cutEdges = this.graph.deleteCutEdges();
		this.edgeRingList = this.graph.getEdgeRings();
		this.validEdgeRingList = [];
		this.invalidRingList = [];
		// this.edgeRingList = [];
		this.findValidRings();
		this.findShellsAndHoles();
		//this.assignHolesToShells(this.holeList, this.shellList);
		this.polyList = [];
		for(var i = 0, l = this.shellList.length; i < l; i++) {
			var er = this.shellList[i];
			var points = er.getCoordinates();
			this.polyList.push(points);
		}
	},
	
	assignHolesToShells: function(holeList, shellList) {
		for(var i = 0, l = holeList.length; i < l; i++) {
			var holeER = holeList[i];
			this.assignHoleToShell(holeER, shellList);
		}
	},
	
	assignHoleToShell: function(holeER, shellList) {
		var shell = EdgeRing.findEdgeRingContaining(holeER, shellList);
		if(shell != null)
			shell.addHole(holeER.getRing());
	},
	
	findValidRings: function() {
		for(var i = 0, l = this.edgeRingList.length; i < l; i++) {
			var er = this.edgeRingList[i];
			if(er.isValid()) {
				this.validEdgeRingList.push(er);
			} else {
				this.invalidRingList.push(er);
			}
		}
	},
	
	findShellsAndHoles: function() {
		this.holeList = [];
		this.shellList = [];
		for(var i = 0, l = this.edgeRingList.length; i < l; i++) {
			var er = this.edgeRingList[i];
			if(er.isHole()) {
				this.holeList.push(er);
			} else {
				this.shellList.push(er);
			}
		}
	},
});

/**
 * Represents a planar graph of edges that can be used to compute a
 * polygonization, and implements the algorithms to compute the
 * {@link EdgeRings} formed by the graph.
 * <p>
 * The marked flag on {@link DirectedEdge}s is used to indicate that a directed edge
 * has be logically deleted from the graph.
 *
 * @version 1.7
 */
PolygonizeGraph = Base.extend({
	initialize: function() {
		this.edges = [];
		this.dirEdges = [];
		this.nodes = {};
	},
	
	addEdge: function(line) {
		if(line.point1 != line.point2) {
			var startPt = line.point1;
			var endPt = line.point2;

			var nStart = this.getNode(startPt);
			var nEnd = this.getNode(endPt);

			var de0 = new PolygonizeDirectedEdge(nStart, nEnd, line.point2, true);
			var de1 = new PolygonizeDirectedEdge(nEnd, nStart, line.point1, false);
			var edge = new PolygonizeEdge(line);
			edge.setDirectedEdges(de0, de1);
			this.add(edge);
		}
		//var linePts = CoordinateArrays.removeRepeatedPoints(line.getCoordinates());
	},
	
	deleteDangles: function() {
		// nodes to remove:
		var nodeStack = this.findNodesOfDegree(1);
		var dangleLines = [];
		while(nodeStack.length) {
		// for(var i = 0, l = nodesToRemove.length; i < l; i++) {
			var node = nodeStack.pop();
			this.deleteAllEdges(node);
			var nodeOutEdges = node.getOutEdges().getEdges();
			for(var j = 0, l = nodeOutEdges.length; j < l; j++) {
				var de = nodeOutEdges[j];
				de.marked = true;
				var sym = de.getSym();
				if(sym)
					sym.marked = true;
				
				// save the line as a dangle
				var e = de.getEdge();
				dangleLines.push(e);
				var toNode = de.to;
				// add the toNode to the list to be processed, if it is now a dangle
				if (this.getDegreeNonDeleted(toNode) == 1)
					nodeStack.push(toNode);
			}
		}
		return dangleLines;
	},
	
	deleteCutEdges: function() {
		this.computeNextCWEdges();
		// label the current set of edgerings
		this.findLabeledEdgeRings(this.dirEdges);
		/**
		* Cut Edges are edges where both dirEdges have the same label.
		* Delete them, and record them
		*/
		var cutLines = [];
		for(var i = 0, l = this.dirEdges.length; i < l; i++) {
			var de = this.dirEdges[i];
			if(de.marked) continue;
			var sym = de.getSym();
			if(de.label == sym.label) {
				de.marked = true;
				sym.marked = true;
				
				// save the line as a cut edge
				var e = de.getEdge();
				cutLines.push(e.line);
			}
		}
		return cutLines;
	},
	
	computeNextCWEdges: function() {
		this.nodes.each(function(node) {
			var deStar = node.getOutEdges();
			var startDE = null;
			var prevDE = null;
			var edges = deStar.getEdges();
			for(var i = 0, l = edges.length; i < l; i++) {
				var outDE = edges[i];
				if(outDE.marked) continue;
				if(startDE == null)
					startDE = outDE;
				if(prevDE != null) {
					var sym = prevDE.getSym();
					sym.next = outDE;
				}
				prevDE = outDE
			}
			if(prevDE != null) {
				var sym = prevDE.getSym();
				sym.next = startDE;
			}
		}, this);
	},
	
  /**
   * Computes the EdgeRings formed by the edges in this graph.
   * @return a list of the {@link EdgeRing}s found by the polygonization process.
   */
	getEdgeRings: function() {
		// maybe could optimize this, since most of these pointers should be set correctly already
		// by deleteCutEdges()
		this.computeNextCWEdges();
		// clear labels of all edges in graph
		this.label(this.dirEdges, -1);
		var maximalRings = this.findLabeledEdgeRings(this.dirEdges);
		this.convertMaximalToMinimalEdgeRings(maximalRings);
		var edgeRingList = [];
		for(var i = 0, l = this.dirEdges.length; i < l; i++) {
			var de = this.dirEdges[i];
			if(de.marked) continue;
			if(de.isInRing()) continue
			var er = this.findEdgeRing(de);
			edgeRingList.push(er);
		}
		return edgeRingList;
	},
	
	label: function(dirEdges, label) {
		for(var i = 0, l = dirEdges.length; i < l; i++)
			dirEdges[i].label = label;
	},
	
	findEdgeRing: function(startDE) {
		var de = startDE;
		er = new EdgeRing();
		do {
			er.add(de);
			de.setRing(er);
			de = de.next;
		} while (de != startDE);
		return er;
	},
	
	findLabeledEdgeRings: function(dirEdges) {
		var edgeRingStarts = [];
		var currLabel = 1;
		for(var i = 0, l = dirEdges.length; i < l; i++) {
			var de = dirEdges[i];
			if(de.marked) continue;
			if(de.label >= 0) continue;
			
			edgeRingStarts.push(de);
			var edges = this.findDirEdgesInRing(de);
			this.label(edges, currLabel);
			currLabel++;
		}
		return edgeRingStarts;
	},
	
	findDirEdgesInRing: function(startDE) {
		var de = startDE;
		var edges = [];
		do {
			edges.push(de);
			de = de.next;
		} while (de != startDE);
		return edges;
	},
	
	convertMaximalToMinimalEdgeRings: function(ringEdges) {
		for(var i = 0, l = ringEdges.length; i < l; i++) {
			var de = ringEdges[i];
			var label = de.label;
			var intNodes = this.findIntersectionNodes(de, label);
			if(intNodes == null) continue;
			// flip the next pointers on the intersection nodes to create minimal edge rings
			for(var j = 0, l = intNodes.length; j < l; j++) {
				var node = intNodes[j];
				this.computeNextCCWEdges(node, label);
			}
		}
	},
	
	getDegree: function(node, label) {
		var edges = node.getOutEdges().getEdges();
		var degree = 0;
		for(var i = 0, l = edges.length; i < l; i++) {
			var de = edges[i];
			if(de.label == label) degree++;
		}
		return degree;
	},
	
	findIntersectionNodes: function(startDE, label) {
		var intNodes = null;
		var de = startDE;
		do {
			var node = de.from;
			if(this.getDegree(node, label) > 1) {
				if(intNodes == null)
					intNodes = [];
				intNodes.push(node);
			}
			
			de = de.next;
			// if(!de) {
			// 	print('found null DE in ring');
			// }
			// if(de == startDE || !de.isInRing()) {
			// 	print('found DE already in ring');
			// }
		} while (de != startDE);
		
		return intNodes;
	},

	/**
	 * Computes the next edge pointers going CCW around the given node, for the
	 * given edgering label.
	 * This algorithm has the effect of converting maximal edgerings into minimal edgerings
	 */
	computeNextCCWEdges: function(node, label) {
		var deStar = node.getOutEdges();
		var firstOutDE = null;
		var prevInDE = null
		
		// the edges are stored in CCW order around the star
		var edges = deStar.getEdges();
		for(var i = edges.length - 1; i >= 0; i--) {
			var de = edges[i];
			var sym = de.getSym();
			
			var outDE = null;
			if(de.label == label) outDE = de;
			var inDE = null;
			if(sym.label == label) inDE = sym;
			if(outDE == null && inDE == null) continue;  // this edge is not in edgering
			if(inDE != null)
				prevInDE = inDE;
			if(outDE != null) {
				if(prevInDE != null) {
					prevInDE.next = outDE;
					prevInDE = null
				}
				if(firstOutDE == null)
					firstOutDE = outDE;
			}
		}
		if(prevInDE != null) {
			prevInDE.next = firstOutDE;
		}
	},
	
	getDegreeNonDeleted: function(node) {
		var edges = node.getOutEdges().getEdges();
		var degree = 0;
		edges.each(function(de) {
			if(!de.marked) degree++;
		});
		return degree;
	},
	
	findNodesOfDegree: function(degree) {
		var nodesFound = [];
		this.nodes.each(function(node) {
			if(node.getDegree() == degree)
				nodesFound.push(node);
		});
		return nodesFound;
	},
	
	deleteAllEdges: function(node) {
		var edges = node.getOutEdges().getEdges();
		for(var i = 0, l = edges.length; i < l; i++) {
			var de = edges[i];
			de.marked = true;
			var sym = de.getSym();
			if(sym)
				sym.marked = true;
		}
	},
	
  /**
   * Adds the Edge and its DirectedEdges with this PlanarGraph.
   * Assumes that the Edge has already been created with its associated DirectEdges.
   * Only subclasses can add Edges, to ensure the edges added are of the right class.
   */
	add: function(edge) {
		this.edges.push(edge);
		this.dirEdges.push(edge.getDirEdge(0));
		this.dirEdges.push(edge.getDirEdge(1));
	},
	
	getNode: function(point) {
		var node = this.nodes[point.toString()];
		if(!node)
			node = this.nodes[point.toString()] = new Node(point);
		return node;
	}
});

EdgeRing = Base.extend({
	initialize: function() {
		this.deList = [];
		this.ringPts = null;
	},
	add: function(de) {
		this.deList.push(de);
	},
	isValid: function() {
		this.getCoordinates();
		if(this.ringPts.length <= 3) return false;
		return true;
		this.getRing();
		return this.ring.isValid();
	},
	getCoordinates: function() {
		if(!this.ringPts) {
			var coordList = [];
			for(var i = 0, l = this.deList.length; i < l; i++) {
				var de = this.deList[i];
				var edge = de.getEdge();
				var line = edge.line;
				coordList = this.addEdge([line.point1, line.point2], de.edgeDirection, coordList);
			}
			this.ringPts = coordList;
		}
		return this.ringPts;
	},
	addEdge: function(coords, isForward, coordList) {
		if(isForward) {
			for(var i = 0; i < coords.length; i++) {
				coordList.push(coords[i]);
			}
		} else {
			for(var i = coords.length - 1; i >= 0; i--) {
				coordList.push(coords[i]);
			}
		}
		return coordList;
	},
	addHole: function(hole) {
		if(!this.holes)
			this.holes = [];
		this.holes.push(hole);
	},
	getRing: function() {
		if(this.ring) return this.ring;
		this.getCoordinates();
		return this.ringPts;
	},
	isHole: function() {
		var ring = this.getRing();
		return CGAlgorithms.isCCW(ring);
	},
	statics: {
		findEdgeRingContaining: function(testEr, shellList) {
			var testRing = testEr.getRing();
			var testEnv = testRing.getEnvelopeInternal();
			var testPt = testRing.getCoordinateN(0);
			
			var minShell = null;
			var minEnv = null;
			for(var i = 0, l = shellList.length; i < l; i++) {
				var tryShell = shellList[i];
				var tryRing = tryShell.getRing();
				var tryEnv = tryRing.getEnvelopeInternal();
				if(minShell != null) minEnv = minShell.getRing().getEnvelopeInternal();
				var isContained = false;
				if(tryEnv == testEnv)
					continue;
				var testPt = CoordinateArrays.ptNotInList(testRing.getCoordinates(), tryRing.getCoordinates());
				var isContained = tryEnv.contains(testEnv) && cga.isPointInRing(testPt, tryRing.getCoordinates());
				if(isContained) {
					if(minShell = null || minEnv.contains(tryEnv)) {
						minShell = tryShell;
					}
				}
			}
			return minShell;
		}
	}
});

Edge = Base.extend({
  /**
   * Initializes this Edge's two DirectedEdges, and for each DirectedEdge: sets the
   * Edge, sets the symmetric DirectedEdge, and adds this Edge to its from-Node.
   */
	setDirectedEdges: function(de0, de1) {
		this.dirEdge = [de0, de1];
		de0.setEdge(this);
		de1.setEdge(this);
		de0.setSym(de1);
		de1.setSym(de0);
		de0.from.addOutEdge(de0);
		de1.from.addOutEdge(de1);
	},
	getDirEdge: function(i) {
		return this.dirEdge[i];
	}
});

PolygonizeEdge = Edge.extend({
	initialize: function(line) {
		this.line = line;
	}
});

PolygonizeDirectedEdge = Edge.extend({
	initialize: function(from, to, directionPoint, edgeDirection) {
		this.from = from;
		this.to = to;
		this.edgeDirection = edgeDirection;
		this.p0 = from.point;
		this.p1 = directionPoint;
		// var dx = this.p1.x - this.p0.x;
		// var dy = this.p1.y - this.p0.y;
		var delta = this.p1 - this.p0;
		this.quadrant = Quadrant.quadrant(delta);
		this.angle = Math.atan2(delta.y, delta.x);
	},
	setEdge: function(parentEdge) {
		this.parentEdge = parentEdge;
	},
	getEdge: function() {
		return this.parentEdge;
	},
	/**
	* Sets this DirectedEdge's symmetric DirectedEdge, which runs in the opposite
	* direction.
	*/
	setSym: function(sym) {
		this.sym = sym;
	},
	getSym: function() {
		return this.sym;
	},
	
	compareDirection: function(e) {
		if(this.quadrant > e.quadrant) return 1;
		if(this.quadrant < e.quadrant) return -1;
		// vectors are in the same quadrant - check relative orientation of direction vectors
		// this is > e if it is CCW of e
		return CGAlgorithms.computeOrientation(e.p0, e.p1, this.p1);
	},
	
	setRing: function(edgeRing) {
		this.edgeRing = edgeRing;
	},
	
	isInRing: function() {
		return !!this.edgeRing
	}
});

Quadrant = Base.extend({
	statics: {
		quadrant: function(p) {
			if(p.x == 0 && p.y == 0) {
				print('Cannot compute the quadrant for point' + p);
				return;
			} else if(p.x >= 0) {
				return p.y >=0 ? 0 : 3;
			} else {
				return p.y >= 0 ? 1 : 2;
			}
		}
	}
});

Node = Base.extend({
	initialize: function(pt) {
		this.point = pt;
		this.deStar = new DirectedEdgeStar();
	},
	addOutEdge: function(de) {
		this.deStar.add(de);
	},
	
	getDegree: function() {
		return this.deStar.getDegree();
	},
	
	getOutEdges: function() {
		return this.deStar;
	}
});

/**
 * A sorted collection of {@link DirectedEdge}s which leave a {@link Node}
 * in a {@link PlanarGraph}.
 *
 * @version 1.7
 */
DirectedEdgeStar = Base.extend({
	initialize: function() {
		this.outEdges = [];
		this.storted = false;
	},
	add: function(directedEdge) {
		this.outEdges.push(directedEdge);
		this.sorted = false;
	},
	getDegree: function() {
		return this.outEdges.length;
	},
	getEdges: function() {
		this.sortEdges();
		return this.outEdges;
	},
	sortEdges: function() {
		if(!this.sorted) {
			this.outEdges.sort(function(a, b){
				return a.compareDirection(b);
			});
		}
		this.sorted = true;
	}
});

CGAlgorithms = {
	computeOrientation: function(p1, p2, q) {
		return CGAlgorithms.orientationIndex(p1, p2, q);
	},
	orientationIndex: function(p1, p2, q) {
		// travelling along p1->p2, turn counter clockwise to get to q return 1,
		// travelling along p1->p2, turn clockwise to get to q return -1,
		// p1, p2 and q are colinear return 0.
		var dx1 = p2.x - p1.x;
		var dy1 = p2.y - p1.y;
		var dx2 = q.x - p2.x;
		var dy2 = q.y - p2.y;
		return RobustDeterminant.signOfDet2x2(dx1, dy1, dx2, dy2);
	},
	isCCW: function(ring) {
		var nPts = ring.length - 1;
		var hiPt = ring[0];
		var hiIndex = 0;
		for(var i = 1; i <= nPts; i++) {
			var p = ring[i];
			if(p.y > hiPt.y) {
				hiPt = p;
				hiIndex = i;
			}
		}
		
		//find distinct point before highest point
		var iPrev = hiIndex;
		do {
			iPrev = iPrev - 1;
			if(iPrev < 0) iPrev = nPts;
		} while (ring[iPrev] == hiPt && iPrev != hiIndex);
		
		//find distinct point after highest point
		var iNext = hiIndex;
		do {
			iNext = (iNext + 1) % nPts;
		} while (ring[iNext] == hiPt && iNext != hiIndex);
		
		var prev = ring[iPrev];
		var next = ring[iNext];
		
		/**
		 * This check catches cases where the ring contains an A-B-A configuration of points.
		 * This can happen if the ring does not contain 3 distinct points
		 * (including the case where the input array has fewer than 4 elements),
		 * or it contains coincident line segments.
		 */
		if(prev == hiPt || next == hiPt || prev == next)
			return false;
		var disc = CGAlgorithms.computeOrientation(prev, hiPt, next);

		/**
		 *  If disc is exactly 0, lines are collinear.  There are two possible cases:
		 *  (1) the lines lie along the x axis in opposite directions
		 *  (2) the lines lie on top of one another
		 *
		 *  (1) is handled by checking if next is left of prev ==> CCW
		 *  (2) will never happen if the ring is valid, so don't check for it
		 *  (Might want to assert this)
		 */
		var isCCW = false;
		if(disc == 0) {
			// poly is CCW if prev x is right of next x
			isCCW = prev.x > next.x;
		} else {
			// if area is positive, points are ordered CCW
			isCCW = (disc > 0);
		}
		return isCCW;
	}
};

RobustDeterminant = {
	signOfDet2x2: function(x1, y1, x2, y2) {
		// returns -1 if the determinant is negative,
		// returns  1 if the determinant is positive,
		// retunrs  0 if the determinant is null.
		var sign, swap, k, count = 0;

		//callCount++; // debugging only

		sign = 1;

		/*
		 *  testing null entries
		 */
		if ((x1 == 0) || (y2 == 0)) {
		  if ((y1 == 0) || (x2 == 0)) {
			return 0;
		  }
		  else if (y1 > 0) {
			if (x2 > 0) {
			  return -sign;
			}
			else {
			  return sign;
			}
		  }
		  else {
			if (x2 > 0) {
			  return sign;
			}
			else {
			  return -sign;
			}
		  }
		}
		if ((y1 == 0) || (x2 == 0)) {
		  if (y2 > 0) {
			if (x1 > 0) {
			  return sign;
			}
			else {
			  return -sign;
			}
		  }
		  else {
			if (x1 > 0) {
			  return -sign;
			}
			else {
			  return sign;
			}
		  }
		}

		/*
		 *  making y coordinates positive and permuting the entries
		 */
		/*
		 *  so that y2 is the biggest one
		 */
		if (0 < y1) {
		  if (0 < y2) {
			if (y1 <= y2) {
			  ;
			}
			else {
			  sign = -sign;
			  swap = x1;
			  x1 = x2;
			  x2 = swap;
			  swap = y1;
			  y1 = y2;
			  y2 = swap;
			}
		  }
		  else {
			if (y1 <= -y2) {
			  sign = -sign;
			  x2 = -x2;
			  y2 = -y2;
			}
			else {
			  swap = x1;
			  x1 = -x2;
			  x2 = swap;
			  swap = y1;
			  y1 = -y2;
			  y2 = swap;
			}
		  }
		}
		else {
		  if (0 < y2) {
			if (-y1 <= y2) {
			  sign = -sign;
			  x1 = -x1;
			  y1 = -y1;
			}
			else {
			  swap = -x1;
			  x1 = x2;
			  x2 = swap;
			  swap = -y1;
			  y1 = y2;
			  y2 = swap;
			}
		  }
		  else {
			if (y1 >= y2) {
			  x1 = -x1;
			  y1 = -y1;
			  x2 = -x2;
			  y2 = -y2;
			  ;
			}
			else {
			  sign = -sign;
			  swap = -x1;
			  x1 = -x2;
			  x2 = swap;
			  swap = -y1;
			  y1 = -y2;
			  y2 = swap;
			}
		  }
		}

		/*
		 *  making x coordinates positive
		 */
		/*
		 *  if |x2| < |x1| one can conclude
		 */
		if (0 < x1) {
		  if (0 < x2) {
			if (x1 <= x2) {
			  ;
			}
			else {
			  return sign;
			}
		  }
		  else {
			return sign;
		  }
		}
		else {
		  if (0 < x2) {
			return -sign;
		  }
		  else {
			if (x1 >= x2) {
			  sign = -sign;
			  x1 = -x1;
			  x2 = -x2;
			  ;
			}
			else {
			  return -sign;
			}
		  }
		}

		/*
		 *  all entries strictly positive   x1 <= x2 and y1 <= y2
		 */
		while (true) {
		  count = count + 1;
		  k = Math.floor(x2 / x1);
		  x2 = x2 - k * x1;
		  y2 = y2 - k * y1;

		  /*
		   *  testing if R (new U2) is in U1 rectangle
		   */
		  if (y2 < 0) {
			return -sign;
		  }
		  if (y2 > y1) {
			return sign;
		  }

		  /*
		   *  finding R'
		   */
		  if (x1 > x2 + x2) {
			if (y1 < y2 + y2) {
			  return sign;
			}
		  }
		  else {
			if (y1 > y2 + y2) {
			  return -sign;
			}
			else {
			  x2 = x1 - x2;
			  y2 = y1 - y2;
			  sign = -sign;
			}
		  }
		  if (y2 == 0) {
			if (x2 == 0) {
			  return 0;
			}
			else {
			  return -sign;
			}
		  }
		  if (x2 == 0) {
			return sign;
		  }

		  /*
		   *  exchange 1 and 2 role.
		   */
		  k = Math.floor(x1 / x2);
		  x1 = x1 - k * x2;
		  y1 = y1 - k * y2;

		  /*
		   *  testing if R (new U1) is in U2 rectangle
		   */
		  if (y1 < 0) {
			return sign;
		  }
		  if (y1 > y2) {
			return -sign;
		  }

		  /*
		   *  finding R'
		   */
		  if (x2 > x1 + x1) {
			if (y2 < y1 + y1) {
			  return -sign;
			}
		  }
		  else {
			if (y2 > y1 + y1) {
			  return sign;
			}
			else {
			  x1 = x2 - x1;
			  y1 = y2 - y1;
			  sign = -sign;
			}
		  }
		  if (y1 == 0) {
			if (x1 == 0) {
			  return 0;
			}
			else {
			  return sign;
			}
		  }
		  if (x1 == 0) {
			return -sign;
		  }
		}

	}
}

var structure = new Structure();
