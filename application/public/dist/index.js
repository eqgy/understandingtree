//var mainApp = angular.module("uTreeApp", ['datatables']);
var treeArray = [];

//global parameters:
// Database settings //
//var urlDomain = "http://localhost:3000/users/"; // local database
var urlDomain="http://192.12.23.132:80/users/";
//var urlDomain="http://192.168.2.52:3000/users/";
const defaultPwd="robertutree";
// ************** Generate the tree diagram	 *****************
var margin = { top: 20, right: 120, bottom: 20, left: 120 },
    width = 960 - margin.right - margin.left, //Set to middle panel left margin
    height = 755 - margin.top - margin.bottom, //set to middle panel height
    showNodes = false,  //Display Nodes in uTree
	showLinks = false,  //Display Links/branches between leaves in uTree
	showNodeText = false; //Display branch text

//Voting scale: sets the leafs size as per the size indicated in the following matrix
var votingScale=[]; //Standard voting scale for both Solutions & Problems
var votingDampeningScale = [];	//Solution's Dampening scale
var items=[], items2=[], items3=[], items4 = [];
	
var i = 0;
var j = 0;
var circleRadius = 1; // size of the circle at node
var angleValue = 5; // Branch (ie., diagonal) slope 
var diagonalLength = 450 // Branch (ie., diagonal)  length
var divergentLength = 400 // Divergent branch length
var updateDetailDate=null;
var selectedNodeName=null;
var lastSelected = null; 
 
var DBTreeCls = {
    id: '',
    topic: {}
}
var root={}//json tree object.

var tree = d3.layout.tree()
      .size([height, width])
      .separation(function (a, b) {
          return ((a.parent == root) && (b.parent == root)) ? 5 : 6;
      })

var svg = d3.select(".und-tree").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)   
    .call(d3.behavior.zoom().on("zoom", function () {  //For zoom and pan .call function//
        svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
    }))
    .append("g");


$(document).ready(function () {

    function UnderstandingUniverse() {
        this.addTopicUrl = urlDomain + 'topiclist';
        this.removeTopicUrl = urlDomain + 'removeTopicById';       

    }

    UnderstandingUniverse.prototype = {
        getTopics: function () {
            var deferred = $.Deferred();
            $.ajax({
                url: this.addTopicUrl,
                type: "GET",
                contentType: "json",
                success: function (retTree) {

                    deferred.resolve(retTree);

                },
                error: function (data) {
                    deferred.reject(data);
                }
            });
            return deferred.promise();
        },
        //bind table
        createTable: function (selector, tblData) {
            $(selector).DataTable({
                data: tblData,
                "paging": false,
                "ordering": true,
                "info": false,
                "search": false,
                "scrollY": "446px",
                "scrollCollapse": true,               
                columns: [
                            { data: 'topic' },
                            { data: 'category' },
                            { data: 'createdon' },
                            { data: 'createdby' },
                            { "defaultContent": "<img class='clsView' src='assets/images/view.png' style='height:15px;width:15px;'  data-target='#pwdModal'>"},
							{ "defaultContent": "<img class='clsDelete' src='assets/images/bin.png' height='15' width='15'>"}
                ],
                "order": [2, 'desc']
            });
        },
        //delete topic from table
        removeTopic: function (topicId) {
            $.ajax({
                url: this.removeTopicUrl,
                type: "POST",
                datatype: "json",
                contentType: "application/json",
                data: JSON.stringify({ "topicId": topicId }), //JSON.stringify(topicObj),
                success: function (retTree) {
                    if (retTree.msg == '9999') {
                        alert("Error Occured! Not able to delete Selected Topic.");
                    } else {
                        uuObj.flushTable('#topicsTbl');
                        uuObj.createTable('#topicsTbl', retTree);
                        alert("Selected Topic got deleted Successfully!!");
                    }
                }
            });
        },

        flushTable: function (tableSelctor) {
            $(tableSelctor).dataTable().fnDestroy();
        },
        registerTableEvents: function () {           
			var tblRow = '';
            $('#topicsTbl tbody').off('click', 'clsView').on('click', '.clsView', function () {
				var topicsTable = $('#topicsTbl').DataTable();
                var selectedRow = $(this).closest('tr');
                tblRow = topicsTable.row(selectedRow).data();               
                var modalToOpen = $(this).data("target");
                $(modalToOpen).modal('show');
				 $('.psdValid').addClass("hide");
                $('#password').val("");
            });

            $('#topicsTbl tbody').off('click', 'clsDelete').on('click', '.clsDelete', function () {
				var topicsTable = $('#topicsTbl').DataTable();
                var selectedRow = $(this).closest('tr');
                tblRow = topicsTable.row(selectedRow).data();
                var retVal = confirm("DELETE CONFIRMATION: Are you sure you want to delete the selected Topic?");
                if (retVal == true) {
                    uuObj.removeTopic(tblRow._id);
                }
                else {
                    /* DO NOTHING */;
                }
            });

            $("body").off('click', '#submitPwd').on('click', '#submitPwd', function () {
                var comparePwd=tblRow.password?tblRow.password:defaultPwd;
                if($('#password').val()!=comparePwd){
                    $('.psdValid').removeClass("hide");
                    return false;
                }
                $('#pwdModal').modal('hide');
                $("#spnTopic").text(tblRow.topic);
                var tabid = $(".t-tabs li[rel='mtab1']").attr("rel")
                $(".t-tabs li[rel='mtab1']").parents('.t-tabs-area').find('.active').removeClass('active');
                $(".t-tabs li[rel='mtab1']").parents('.t-tabs-area').find('.tab-cont').hide();
                $('#' + tabid).show();
                $(".t-tabs li[rel='mtab1']").addClass('active');
                getTopicTree(tblRow._id);
            });

            $("#saveTopic").submit(function(e) {
                var gUser = "Jane Doe";
                var topicObj={
                    "topic":$("#txtTopicTitle").val(),
                    "category":$("#txtTopicCategory").val(),
                    "password":$("#txtPwd").val(),
                    "createdby": gUser,
                    "createdon": getCurrentDatetime()			
                }

		
                $.ajax({
                    url: urlDomain + 'addTopic',
                    type: "POST",
                    datatype: "json",
                    contentType: "application/json",
                    data: JSON.stringify(topicObj),
                    success: function (retTree) {
                        if (retTree.length >= 1) {
                            $('#topicsTbl').dataTable().fnDestroy();
                            uuObj.createTable('#topicsTbl', retTree);
               
                        }
                    }
                });

		
                $('#save-topic-popup').hide();
                e.preventDefault();
            });	

            //Save Topic - start 
            //Render add topic popup
            $("#displayAddTopicPopup").unbind("click");
            $("#displayAddTopicPopup").click(function() {
                $('#txtTopicTitle').val("");
                $('#txtPwd').val("");
                $('#txtTopicCategory').val("");			
                $('#save-topic-popup').show();
            });
	
            $("#cancelTopic").click(function() {
                $('#txtTopicTitle').val("");
                $('#txtTopicCategory').val("");			
                $('#save-topic-popup').hide();
            });	

        },
        init:function(){

        }
    }


    var uuObj = window.uuObj= new UnderstandingUniverse();
    var promise = uuObj.getTopics();
    promise.done(function (data) {
        uuObj.createTable('#topicsTbl', data);
        uuObj.registerTableEvents();
    })    
    

    function getTopicTree(topicId) {
        var url = urlDomain + 'topicById/' + topicId
        $.ajax({
            url: url,
            type: "GET",
            datatype: "json",
            contentType: "application/json",
            success: function (retTree) {
                if (retTree.length == 0)
                    return false;

                DBTreeCls.id = retTree[0]._id;
                DBTreeCls.topic = retTree[0].topic;

                //treeview in right panel
                initilaizeTreeView([retTree[0].topic])

                //initializeTree(retTree[0].topic); //Display tree with d3
                initializeTree(DBTreeCls.topic);

            }
        });
    }    


    function initilaizeTreeView(topicObj) {
       
        //convertToJtreeData(topicObj);
        //$j1_9_1('#jstree').jstree(true).refresh();
        $('#jstree')
         // listen for event
         .on('select_node.jstree', function (e, data) {
             var i, jCount, r;
             for (i = 0, jCount = data.selected.length; i < jCount; i++) {
                 r = data.instance.get_node(data.selected[i]).id;
             }
             //selectNodesWithProperty('svg circle', 'title', r);
             SelectTreeNode([root], r);
         })
         // create the instance
                 .jstree({
                     'core': {
                         //'check_callback': true,
                         'data': treeArray
                     },
                     "plugins": ["themes", "search"]
                 })
    }

    function initializeTree(treeData) {

        root = treeData;
        update(null,"root");
    }

    function update(selectedNode, p_nodetype) {
        // Compute the new tree layout.

        svg.selectAll("*").remove();

        var nodecount = 0;
        var v_nodetype = p_nodetype;

        //remove nodes from root
        if(v_nodetype === "deleteleafnode"){
            deleteLeafNode(root,selectedNode);
        }

        var nodes = tree.nodes(root)//.reverse(),
       
        links = tree.links(nodes),
        j = nodes.length-1;

        
        //normalize nodes
        nodes.forEach(function (d) {
            nodecount = nodecount + 1;

            //d.y = (d.level * 600); //diagonal branch length
            d.y = (d.level * diagonalLength);
            //d.x = divergentLength; //divergent branch length
            //d.y = (d.level * 600);
            d.x = 400;

            if (d.angletype == "di") { 
                d.x = d.parent.x - d.value * (60);
            } else if (d.angletype == "dd") {
                d.x = d.parent.x + d.value * (60);
                // d.y = (d.level * 90);
            }
            else if (d.angletype == "si") {
                //d.x = d.parent.x - 1 * ((d.parent.children.indexOf(d) + 1) * 60);
                //d.y = (d.level * 90);
                d.x = d.parent.x - d.value * 60;
            } else if (d.angletype == "sd") {
                d.x = d.parent.x + d.value * 60;
                //d.y = (d.level * 90);
            } else if(d.angletype=="ce"){//counter expand
                d.x=d.parent.x;
                //d.y = (d.level * diagonalLength);
            }
                //add parent to root node
            else if (d.angletype == "root") {
                if (d.value == angleValue) {
                    d.value = angleValue;                    
                }
                d.parent = "null";
            }

            //}
            // console.log("End of Normalized Node::: " + d.id + " | (" + d.x + " , " + d.y + ") | " + d.angletype + " | " + d.parent.id);
        });
        var extendLength = false        
        var breakLoop = false;

        loopNodes();

        function loopNodes() {
            for (n = 0; n < nodes.length; n++) {
                var d = nodes[n];
                calculateLength(d);
                if (breakLoop) {
                    n = -1;
                    breakLoop = false;
                }

            }
        }

        function calculateLength(pNode) {

            $.each(nodes, function (i, d) {
                if (pNode.level == d.level && (pNode.x == d.x || FindLineIntersection(pNode, d)) && (pNode.id != d.id)) {
                    //Find parent
                    var newNode = d;
                    var currentNode = pNode;
                    var dParent=true, pNodeParent=false;
                    return CheckParent(pNode, d);
                   
                    
                    //var current
                    function CheckParent(pNode, d) {
                        //var pNodeParent = GetParent(pNode);
                        //d = GetParent(d);
                        if (d) {
                            if (pNode.parent.x == d.parent.x && pNode.parent.y == d.parent.y) {
                                //check pNode and d angles
                                if (pNode.angletype == "di" || pNode.angletype == "dd") {
                                    pNode.value = pNode.value + 1;
                                    extendLength = "true";
                                    return false;
                                } else if (d.angletype == "di" || d.angletype == "dd") {
                                    d.value = d.value + 1;
                                    extendLength = "true";
                                    return false;
                                } else if (pNode.angletype == "si" && d.angletype == "sd") {
                                    if (pNode.value == d.value)
                                        pNode.value = pNode.value + 1;
                                    else if (pNode.value > d.value)
                                        d.value = d.value + 1;
                                    else if (d.value > pNode.value)
                                        pNode.value = pNode.value + 1;
                                    extendLength = "true";
                                    return false;
                                } else if (pNode.angletype == "sd" && d.angletype == "si") {
                                    if (pNode.value == d.value)
                                        pNode.value = pNode.value + 1;
                                    else if (pNode.value > d.value)
                                        d.value = d.value + 1;
                                    else if (d.value > pNode.value)
                                        pNode.value = pNode.value + 1;
                                    extendLength = "true";
                                    return false;
                                }
                                else if (pNode.angletype == "ce" && d.angletype == "si") {
                                    d.value=d.value+1;
                                    extendLength = "true";
                                    return false;
                                } else if (pNode.angletype == "ce" && d.angletype == "sd") {
                                    d.value=d.value+1;
                                    extendLength = "true";
                                    return false;                                    
                                }
                                else if (pNode.angletype == "si" && d.angletype == "ce") {
                                    pNode.value=pNode.value+1;
                                    extendLength = "true";
                                    return false;                                    
                                } else if (pNode.angletype == "sd" && d.angletype == "ce") {
                                    pNode.value=pNode.value+1;
                                    extendLength = "true";
                                    return false;   
                                }
                            } else if(d.parent.angletype!=="root" && dParent){
                                dParent=false;
                                pNodeParent=true
                                return CheckParent(pNode, d.parent);
                                
                            }else if(pNode.parent.angletype!=="root" && pNodeParent){
                                dParent=false;
                                pNodeParent=true
                                return CheckParent(pNode.parent, d);
                            }else if(d.parent.angletype=="root" && dParent){
                                dParent=false;
                                pNodeParent=true
                                return CheckParent(pNode.parent, d);                                
                            }
                            
                            //else if (d.angletype == "root") {
                            //    d = newNode;
                            //    return CheckParent(pNode.parent, d);
                            //    //CheckParent(pNodeParent, dParent);
                            //} else {                                
                            //    return CheckParent(pNode, d.parent);
                            //}
                        }
                    }
                }
            })

            if (extendLength == "true") {
                SetNodes();
            }

            function SetNodes() {
                extendLength = "false";
                breakLoop = true;
                nodes.forEach(function (d) {
                    if (d.angletype == "di") {
                        d.x = d.parent.x - d.value * (60);
                    }
                    if (d.angletype == "si") {
                        d.x = d.parent.x - d.value * 60;
                        //d.y = (d.level * 90);

                    } else if (d.angletype == "sd") {
                        d.x = d.parent.x + d.value * 60;
                        //d.y = (d.level * 90);
                    }

                    else if (d.angletype == "dd") {
                        d.x = d.parent.x + d.value * (60);
                        // d.y = d.parent.y * d.level;
                    } else if(d.angletype=="ce"){//counter expand
                        d.x=d.parent.x;
                        //d.y = (d.level * diagonalLength);
                    }

                });
                //calculateLength(v_nodetype);
            }
        }


        var node = svg.selectAll("g.node")
                      .data(nodes, function (d) { return d.id || (d.id = ++i); });



        //Enter the nodes a.k.a initialize nodes	   

        var nodeEnter = node.enter().append("g")
                        .attr("class", function (d) {
                            if (d.children || d.posttype == "dp" || showNodes) { 
                                return "node";
                            } else {
                                return "nodevisible";
                            }                            
                        });



        nodeEnter.append("circle")
                 .attr("r", circleRadius);



        nodeEnter.append("text")
          .attr("x", function (d) {
              return d.children || d._children ? (15) * -1 : +15
          })
          .attr("dy", ".35em")
          .attr("text-anchor", function (d) {
              return d.children || d._children ? "end" : "start";
          })
          .text(function (d) {
              //if (d.children || showNodeText) {
              //    return d.title;
              //}
              if (showNodeText) {
                  return d.title;
              }
          })
          .style("fill-opacity", 1);


        // Declare links
        var link = svg.selectAll("link")
                      .data(links, function (d) {
                          //if (d.target.children) {
                          //return d.target.id;
                          //}
                          return d.target.id;
                      });

        var imageHeight = 30;
        var imageWidth = 40;

        link.enter().append("image")
            .attr("class", "img")
            .attr("xlink:href", function (d) {
                // console.log("******* posttype=", d.target);
                if (d.target.posttype == "sc" && d.target.angletype == "si") {
                    if (d.target.isSelected == false) {
                        return "assets/images/leaf-green-v0.svg";
                    } else { return "assets/images/leaf-green-selected-v0.svg"; }
                } else if (d.target.posttype == "sc" && d.target.angletype == "sd") {
                    if (d.target.isSelected == false) {
                        return "assets/images/leaf-red-v0.svg";
                    } else { return "assets/images/leaf-red-selected-v0.svg"; }

                } else if (d.target.posttype == "ca" && d.target.angletype == "sd") {
                    if (d.target.isSelected == false) {
                        return "assets/images/leaf-red-v0.svg";
                    } else { return "assets/images/leaf-red-selected-v0.svg"; }

                } else if (d.target.posttype == "ca" && d.target.angletype == "si") {
                    if (d.target.isSelected == false) {
                        return "assets/images/leaf-green-v0.svg";
                    } else { return "assets/images/leaf-green-selected-v0.svg"; }
                }

            })
            .each(function (d) {
                /*    var ix = d.source.y + ((circleRadius * (d.target.y - d.source.y)) / (Math.sqrt(((d.source.y - d.target.y) * (d.source.y - d.target.y)) + ((d.source.x - d.target.x) * (d.source.x - d.target.x)))));
    
                    var iy = d.source.x + ((circleRadius * (d.target.x - d.source.x)) / (Math.sqrt(((d.source.y - d.target.y) * (d.source.y - d.target.y)) + ((d.source.x - d.target.x) * (d.source.x - d.target.x))))); // 40 is the distance from source to cy
                
                    var angleDeg = Math.atan2(d.target.x - d.source.x, d.target.y - d.source.y) * 180 / Math.PI;
                */
                if ((d.source.angletype == "sd" && d.target.angletype == "sd") || (d.source.angletype == "dd" && d.target.angletype == "sd") || 
                    (d.source.angletype == "root" && d.target.angletype == "sd") || (d.source.angletype == "si" && d.target.angletype == "si") || 
                    (d.source.angletype == "di" && d.target.angletype == "si") || (d.source.angletype == "root" && d.target.angletype == "si") ||
                    (d.source.angletype == "sd" && d.target.angletype == "si") || (d.source.angletype == "si" && d.target.angletype == "sd") || 
                    (d.source.angletype == "di" && d.target.angletype == "sd") || (d.source.angletype == "dd" && d.target.angletype == "si") || 
                    (d.source.angletype == "ce" && d.target.angletype == "si") || (d.source.angletype == "ce" && d.target.angletype == "sd")) {

                    var ix = 0; //d.source.y;
                    var iy = 0; //d.source.x;
                    var angleDeg = 0;
					
                    //Display Leaf size by votes - START
                    //set min leaf size
                    var imageHeight = 20;
                    var imageWidth = 20;
                    var scale = d3.scale.linear()
                                       .domain([1,2,3,4,5,6,7,8,9,10])
                                       .range(votingScale);
                    var solDampScale = d3.scale.linear()
														.domain([1,2,3,4,5,6,7,8,9,10])
														.range(votingDampeningScale);
                    if (d.target.votecount == 0) {
                        //console.log(d.target.votecount);
                        /* DO NOTHING */ ; // set default min size
                    } else {
                        var leafSize = 0;
                        //var scale = d3.scale.linear()
						//				.domain([1,2,3,4,5,6,7,8,9,10])
						//				.range(votingScale);
                        // .range([10,20,40,80,160]);

                        if (d.target.angletype == "sd" || d.target.angletype == "dd") {
                            //problem
                            //if (d.target.votequalsum == 1) {				
                            //    console.log("@problem:d.target.votequalsum");
                            //    /* DO NOTHING */ ; //set default min size							
                            //} else {
                                leafSize = scale(d.target.votequalsum) + solDampScale(d.target.votequansum);
                                imageWidth = leafSize;
                                imageHeight = leafSize;
                                // console.log("@LeafSize=", leafSize);
                            //}							
                        } else {
                            //solution
                            //if (d.target.votequalsum == 1) {				
                            //    /* DO NOTHING */ ; //set default min size							
                            //}
                            //else if (d.target.votequalsum == 2)  {
                            //    var solDampScale = d3.scale.linear()
							//							.domain([1,2,3,4,5,6,7,8,9,10])
							//							.range(votingDampeningScale);
                            //    // .range([20,28,36,42,50]);		
                            //    leafSize = solDampScale(d.target.votequansum);
                            //    // console.log("@Dampening=",leafSize); 
                            //    imageWidth = leafSize;
                            //    imageHeight = leafSize;							
                            //}
                            //else {
                                leafSize = scale(d.target.votequalsum) + solDampScale(d.target.votequansum);
                                imageWidth = leafSize;
                                imageHeight = leafSize;							
                            //}

                        }					
                    }

					
                    /* VOTING by Avg basis (multiuser basis) - START 
                                        //Set leaf size
                                        var imageHeight = 20;
                                        var imageWidth = 20;
                                        if (d.target.votecount == 0) {
                                            console.log(d.target.votecount);
                                            imageWidth = imageWidth;
                                            imageHeight = imageHeight;
                                        } else {
                                            var voteAvg = (d.target.votequalsum / d.target.votecount) * (d.target.votequansum / d.target.votecount);
                                            imageWidth = imageWidth + (voteAvg * 16);
                                            imageHeight = imageHeight + (voteAvg * 16);
                                        }
                    VOTING by Avg basis (multiuser basis) - END */ 					
		
                    if (d.target.angletype == "sd" || d.target.angletype == "dd") {
                        //problem
                        ix = d.source.y;
                        iy = d.source.x + imageWidth;	
                    } else {
                        //solution
                        ix = d.source.y;
                        iy = d.source.x;
                    }
                    //Display Leaf size by votes - START
					
                    d3.select(this).attr({
                        width: imageWidth,
                        height: imageHeight,
                        x: ix,
                        y: iy - imageHeight //  - 2
                        /* y: iy  - (imageHeight / 2), //to offset the image height (which is set 40 in the above height attr statement)
                         //transform: 'translate(' + ix + ',' + iy + ') rotate (' + angleDeg + ') translate (-' + ix + ',-' + iy + ')'
                         transform: 'translate(' + ix + ',' + iy + ') rotate (' + angleDeg + ') translate (' + -(ix) + ',' + -(iy) + ')'
                         */
                    });
                }
            })
            .on("mouseover", function (d) {
                var divText = tooltip[0][0];
                if (d.target.angletype == "sd") {                    
                    tooltip.html('<header style="background-color:red;height:auto;color:#fff; padding:5px 10px;"><h2 style="display:block; font-size:12px; text-transform:uppercase; margin:0px; ">' + d.target.title + '</h2></header><div style="padding:5px;"><p style="margin:0px; font-size:12px;">' + d.target.abstracttext + '</p></div>');                    
                    divText.style.outlineColor = "red";
                } else if (d.target.angletype == "si") {
                    divText.style.outlineColor = "green";
                    tooltip.html('<header style="background-color:green;height:auto;color:#fff; padding:5px 10px;"><h2 style="display:block; font-size:12px; text-transform:uppercase; margin:0px; ">' + d.target.title + '</h2></header><div style="padding:5px;"><p style="margin:0px; font-size:12px;">' + d.target.abstracttext + '</p></div>');                    
                }
                return tooltip.style("visibility", "visible"); })
            .on("mousemove", function () { 
                return tooltip.style("top", (d3.event.pageY - 150) + "px").style("left", (d3.event.pageX - 1) + "px"); 
            })
            .on("mouseout", function () { 
                return tooltip.style("visibility", "hidden"); 
            })
            .on("click", clickNode)           
            .on('contextmenu', d3.contextMenu(menu, function (d) {
                clickNode(d); //highlight leaf before displaying context menu
                d3.event.preventDefault()
            }));

        link.enter().insert("line", "g")
        .attr("class", function (d) {
            if (d.target.children || d.target.angletype == "di" || d.target.angletype == "dd" || showLinks) {
                return "link";
            } else {
                return "linkvisible";                
            }

        });

        //bind nodes and links
        var t = svg.transition();

        //console.log("@After Transition:--------");
        nodes.forEach(function (d) {
            // console.log(d.id + " | (" + d.x + " , " + d.y + ") | " + d.angletype + " | " + d.parent.id);
        });


        t.selectAll(".link")
            .attr("class", "link")
            .style("stroke", "#8B4513")
            .style("stroke-width", 4)
            //.style("stroke", function (d) { return d.target.level; })
            .attr("x1", function (d) { return d.source.y; })
            .attr("y1", function (d) { return d.source.x; })
            .attr("x2", function (d) { return d.target.y; })
            .attr("y2", function (d) { return d.target.x; });



        //sync node position with link source coordinates	
        t.selectAll(".node")
            .attr("transform", function (d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        //console.log("@After Node Transition:--------");
        nodes.forEach(function (d) {
            //console.log(d.id + " | (" + d.x + " , " + d.y + ") | " + d.angletype + " | " + d.parent.id);
        });


        convertToJtreeData([root]);
        if (selectedNode != "HighlightLeaf") {
            $('#jstree').jstree(true).settings.core.data = treeArray;
            $('#jstree').jstree("refresh");
        }

    }

    var leafDeleted=false;
    function deleteLeafNode(root,selectedNode){
        if(selectedNode.createdFrom == selectedNode.parentid && (selectedNode.parent.angletype=="ce" || selectedNode.parent.angletype=="di" || selectedNode.parent.angletype=="dd")){
            recursiveFuncForDeleteNodes(root,selectedNode.parent.id);
        }else{
            recursiveFuncForDeleteNodes(root,selectedNode.id);
        }
        if(leafDeleted){
            leafDeleted=false;
            deleteLeafNode(root,selectedNode);
        }
    }

    function recursiveFuncForDeleteNodes(val,targetid) {
        //var targetid=selectedNode.id;
        if (val.hasOwnProperty('children')) {
            if (val.children) {
                $.each(val.children, function (index, v) {  
                        if((v.parentid == targetid)||(v.id == targetid)||(v.createdFrom == targetid)){
                            leafDeleted=true;
                            resetParentNodeFlags(root,v);
                            val.children.splice(index, 1);

                            return false;
                        }else if(v.hasOwnProperty('children')) {
                            if (v.children) {
                                recursiveFuncForDeleteNodes(v,targetid);
                            }
                        }
                });
            }           
        }
    }

    function resetParentNodeFlags(node,item){
        if (node.hasOwnProperty('children')) {
            if (node.children) {
                $.each(node.children,function(index,value){
                    if(value.id==item.createdFrom){
                        if(item.posttype=="sc"){
                            value.hassubcategory=false;
                        }else if(item.posttype=="dg"){
                            value.hasdivergent=false;
                        }else if(item.posttype=="ca"){
                            value.hascounterarg=false;
                        }
                    }else if(value.hasOwnProperty('children')) {
                        if (value.children) {
                            resetParentNodeFlags(value,item);
                        }
                    }
                        
                });
            }
        }
    }

function convertToJtreeData(jsonData) {    
   
    //Remove unwanted values and add text value
    cloneTreeView = cloneJsTree({}, jsonData);
    recursiveFunction(cloneTreeView[0]);
       
    buildTree(cloneTreeView);
    treeArray = [];
    treeArray.push(cloneTreeView[0]);
}

function cloneObject(object) {
    return extendObject({}, object);
}

function extendObject(base, object) {
    var visited = [object];    
    var set = [{ value: base }];

    _extend(base, object);
    return base;

    function _extend(base, object) {
        for (var key in object) {
            if (key != "parent") {
            var value = object[key];
            if (typeof value === 'object') {
                //if (typeof value === 'object' && value.angletype != "di" && value.angletype != "dd") {
                var index = visited.indexOf(value);
                if (index === -1) {
                    visited.push(value);
                    if (key == "children" || key == "details") {
                        var newBase = base[key] = [];
                    } else {
                        var newBase = base[key] = {};
                    }
                    //var newBase = base[key] = [];
                    set.push({ up: base, value: newBase });
                    _extend(newBase, value);
                } else {
                    base[key] = set[index].value;
                }
            }
              
            else if (typeof value !== 'object') {
                if (key == "isSelected") {
                    base[key] = false;
                } else {
                    base[key] = value;
                }
            }
            }
        }
    }
}

function cloneJsTree(base, object) {
    var visited = [object];
   
    _extend(base, object);
    return base;

    function _extend(base, object) {
        for (var key in object) {
            if (key != "parent") {
                var value = object[key];               
                if (typeof value === 'object') {
                    if (key == "children" || key == "details") {                      
                            var newBase = base[key] = [];                          
                        } else {                         
                                var newBase = base[key] = {};                                                         
                        }                       
                       _extend(newBase, value);                       
                }
                  
                else {

                    base[key] = value;

                }
            }
        }
    }
}

function recursiveFunction(val) {   
	if (val.hasOwnProperty('children')) {
		if (val.children) {
			$.each(val.children, function (i, v) {                   
				if (!v.isRead) {
					v.isRead = false;
				}
				if ((v.angletype == "dd" && v.children && v.isRead == false)) {
					v.isRead = true;
					$.each(v.children, function (ci, cv) {
						val.children.push(v.children[ci]);
					});
					recursiveFunction(val);
				}
				else if (v.angletype == "di" && v.children && v.isRead == false) {
					v.isRead = true;
					$.each(v.children, function (ci, cv) {
						val.children.push(v.children[ci]);
					});
					recursiveFunction(val);
				}
				else if (v.angletype == "sd" && v.children && v.isRead == false) {
					v.isRead = true;
					recursiveFunction(v);
				}
				else if ((v.angletype == "si" && v.children && v.isRead == false)) {
					v.isRead = true;
					recursiveFunction(v);
				}
			});
		}           
	}
}

function buildTree(item) {
    $.each(item, function (key, val) {        
        val.text = val.title;   
        if (val.hasOwnProperty('children')) {
            if (val.children) {
                for (var i = 0; i < val.children.length; i++) {
                    if (val.children[i].angletype == "dd" || val.children[i].angletype=="di") {
                        val.children.splice(i, 1);

                    }
                }
            }
            buildTree(val.children)
        }
    });
}


	




    //Search functionality
    var to = false;
    $('#searchTree').keyup(function () {
        if (to) { clearTimeout(to); }
        to = setTimeout(function () {
            var v = $('#searchTree').val();
            $('#jstree').jstree(true).search(v);
        }, 250);
    });

    //save details
    $("#svDetails").unbind("click");
    $("#svDetails").click(function () {
		if(CKEDITOR.instances['txtDetails'].getData()){
            if (lastSelected && lastSelected.target) {
                SaveDetails([root], lastSelected.target.id)
                SaveTree();
                refreshDetails(lastSelected.target);

            } else if (lastSelected && lastSelected.hasOwnProperty("isSelected")) {
                SaveDetails([root], lastSelected.id)
                SaveTree();
                refreshDetails(lastSelected);
            }

            CKEDITOR.instances['txtDetails'].setData('');
        }
    })
	
	 //update details
    $("body").off('click', '.edit-details').on('click', '.edit-details', function(){
        CKEDITOR.instances['txtDetails'].setData($(this).parent().next('p').text()); 
        updateDetailDate=$(this).data('created');
        //selectedNodeName=$(this).data('node');
        $('#svDetails').addClass('hide');
        $('#updateDetail').removeClass('hide');
    }); 
    $("#updateDetail").click(function () {
       
        if (lastSelected && lastSelected.target) {
            UpdateDetail([root], lastSelected.target.id, unescape(updateDetailDate))
            SaveTree();
            refreshDetails(lastSelected.target);

        } else if (lastSelected && lastSelected.hasOwnProperty("isSelected")) {
            UpdateDetail([root], lastSelected.id, unescape(updateDetailDate))
            SaveTree();
            refreshDetails(lastSelected);
        }
        //$('#svDetails').removeClass('hide');
        //$('#updateDetail').addClass('hide');


        CKEDITOR.instances['txtDetails'].setData('');
    })

    $("#btnCnclDetails").unbind("click");
    $("#btnCnclDetails").click(function () {
    	CKEDITOR.instances['txtDetails'].setData('');
		$('#svDetails').removeClass('hide');
        $('#updateDetail').addClass('hide');
    })
	
	
		
	
	  // ToolTip Start
	var tooltip = d3.select("body").append("div")                   
					.style("position", "absolute")
					.style("outline","thin solid green")
					.style("z-index", "10")
					.style("height", "150px")  
					.style("width", "300px")
					.style("visibility", "hidden")
					.style("display", "block")
					.style("background-color", "#fff")
					.style("padding", "0px");
	tooltip.on("mouseout", function () { 
	    return tooltip.style("visibility", "hidden"); 
	})
    //// ToolTip End
	//var tooltip;
    // Tree Context Menu
    var menu = [
                {
                    //title: 'Add Counter Argument',
                    title: '<img src="assets/images/add-count-argument.png"> Counter Argument',
                    action: function (elm, d, i) {                      
                        
                        if(!d.target.hascounterarg && d.target.posttype!='ca' ){
                            $('#txtTitle').val("");
                            $('#txtAbstract').val("");
                            $('#save-node-popup').show();
                            $("#saveNode").unbind("click");
                            $("#saveNode").click({ param1: elm, param2: d, param3: i }, SaveCounterNode);
                        }							
                        else if(!d.target.hascounterarg && d.target.posttype=='ca') {					
                            $('#txtTitle').val("");
                            $('#txtAbstract').val("");
                            $('#save-node-popup').show();							
                            //add_node(); //"subnode");
                            //console.log("@subnodeclick");
                            $("#saveNode").unbind("click");
                            $("#saveNode").click({ param1: elm, param2: d, param3: i }, SaveExpandedCounterNode);
                        }
                        else{
                            
                                //8202017. check expanded counter arg
                                alert("A Counter Argument already exists! You cannot create one more counter argument for the selected post.");
                            
                        }
                    }
                },
                {
                    //title: 'Add Sub-category',
                    title: '<img src="assets/images/add-subcategroy.png"> Expand Idea',
                    action: function (elm, d, i) {
						if (d.target.hassubcategory == true) {
							alert("A Sub-category already exists! You cannot create one more sub-category for the selected post.");
						} else {					
								$('#txtTitle').val("");
								$('#txtAbstract').val("");					
								$('#save-node-popup').show();
								//add_node(); //"subnode");
								console.log("@subnodeclick");
								$("#saveNode").unbind("click");
								$("#saveNode").click({ param1: elm, param2: d, param3: i }, SaveSubNode);
						}
                    }
                },				
                {
                    //title: 'Add Divergent',
                    title: '<img src="assets/images/add-divergent.png"> Divergent Idea',
                    action: function (elm, d, i) {
						if (d.target.hasdivergent == true) {
							alert("A Divergent already exists! You cannot create one more Divergent for the selected post.");
						} else {					
							$('#txtTitle').val("");
							$('#txtAbstract').val("");
							$('#save-node-popup').show();
							//add_node(); //"subnode");
							console.log("@subnodeclick");
							$("#saveNode").unbind("click");
							$("#saveNode").click({ param1: elm, param2: d, param3: i }, SaveDivergentNode);
						}                        
                    }
                },
                {   //Vote
                    title: '<img src="assets/images/voteIcon.png"> Vote',
                    action: function (elm, d, i) {
                        gSelectedNode = d;
                        // CR#6 - START
                        qualVal = d.target.votequalsum;
                        quanVal = d.target.votequansum;
                        if (qualVal == 0) {
                            qualVal = 1;
                        }
                        if (quanVal == 0) {
                            quanVal = 1;
                        }

                        if (d.target.angletype == "sd") {
                            //problem
                            $('#sliderseverity').slider({ value: qualVal });
                            $('#sliderplaus').slider({ value: quanVal });
                            $('#votingProblemPopup').show();
                        } else {
                            //solution
                            $('#slidereff').slider({ value: qualVal });
                            $('#slidefeas').slider({ value: quanVal });
                            $('#votingSolutionPopup').show();
                        }
                        // CR#6 - END
                    }
                },
                {
                    //edit title. change request start
                    title: '<img src="assets/images/edit-icon.png" style="width:16px;height:16px"> Edit Leaf',
                    action: function (elm, d, i) {

                        $('#txtTitle').val(d.target.title);
                        $('#txtAbstract').val(d.target.abstracttext);
                        $('#save-node-popup').show();
                        //add_node(); //"subnode");
                        //console.log("@subnodeclick");
                        $("#saveNode").unbind("click");
                        $("#saveNode").click({ param1: elm, param2: d, param3: i }, updateNode);
                    
                    }
                },
                {
                    //delete -added by kc
                    title: '<img src="assets/images/bin.png" style="width:16px;height:16px"> Delete',
                    action: function (elm, d, i) {

                        var retVal = confirm("DELETE CONFIRMATION: Are you sure you want to delete the selected Leaf?");
                        if (retVal == true) {
                            deleteLeaf(d);
                        }
                       
                        //$("#saveNode").click({ param1: elm, param2: d, param3: i }, deleteLeaf);
                    
                    }
                }

                //#change request end
    ];


    //check title and abstract text
    function ValidateNode(){
        if ($("#txtTitle").val() == "undefined" || $("#txtTitle").val().trim() == "") {
            alert("Please enter Title");
            return false;
        }
        return true;
    }

    //voting popup solution - start
    $('#votingSolutionPopup').hide();

    $("#votesubmit").click(function () {

        var valQual = $('#slidereff').slider('option', 'value');
        var valQuan = $('#slidefeas').slider('value');

        $('#votingSolutionPopup').hide();
        setVote(gSelectedNode, valQual, valQuan);
        gSelectedNode = null;
    });

    $("#votecancel").click(function () {
        $('#votingSolutionPopup').hide();
    });
    //voting solution popup - end

    //voting problem popup  - start
    $('#votingProblemPopup').hide();

    $("#votesubmitprob").click(function () {
        var valQual = $('#sliderseverity').slider('option', 'value');
        var valQuan = $('#sliderplaus').slider('value');

        $('#votingProblemPopup').hide();
        setVote(gSelectedNode, valQual, valQuan);
        gSelectedNode = null;
    });

    $("#votecancelprob").click(function () {
        $('#votingProblemPopup').hide();
    });
    // voting problem popup - end

    function setVote(d, pQual, pQuan) {
        //set vote count and vote averages
        var votecnt = 0;

        var newqualvalue = pQual; //temp
        var newquanvalue = pQuan; //temp

        /* 24/9/15 SATISH: Following section has been commented to support leaf size by last vote rather by total votes posted,
		   so if you want to support leaf size by total votes, uncomment this section and comment out "Leaf size by last vote" section 
		*/
        /* Leaf size by Aggregate votes - START
		votecnt = d.target.votecount + 1;
        qualsum = (d.target.votequalsum + newqualvalue);
        quansum = (d.target.votequansum + newquanvalue);
		Leaf size by Aggregate votes - END */

        // Leaf size by last vote - START
        votecnt = 1;
        qualsum = newqualvalue;
        quansum = newquanvalue;
        // Leaf size by last vote - START

        d.target.votecount = votecnt;
        d.target.votequalsum = qualsum;
        d.target.votequansum = quansum;
        update();
        SaveTree();
    }


    

    function GetParent(currentNode) {
        if (currentNode.parent && currentNode.parent != "null") {
            return currentNode.parent;
        }
      
    }

    function FindLineIntersection(currentNode, newNode) {
      
        if (!currentNode.parent || !newNode.parent)
            return false;
            //first line
            var m1 = (currentNode.y - currentNode.parent.y) / (currentNode.x - currentNode.parent.x)

            var b1 = (m1 * currentNode.x) - currentNode.y;



        //second line
        var m2 = (newNode.y - newNode.parent.y) / (newNode.x - newNode.parent.x)

        var b2 = newNode.y - (m2 * newNode.x);

        var x1 = (b1 + b2) / (m1 - m2);

        var y1 = m1 * x1 - b1;

        if (x1 > currentNode.parent.x && x1 < currentNode.x && ((y1 > currentNode.parent.y && y1 < currentNode.y) || (y1 == currentNode.parent.y && y1 == currentNode.y))) {
            return true;
        } else if (x1 < currentNode.parent.x && x1 > currentNode.x && ((y1 > currentNode.parent.y && y1 < currentNode.y) || (y1 == currentNode.parent.y && y1 == currentNode.y))) {
            return true
        }

        return false;

    }


    
    function clickNode(d) {
        if (lastSelected != d) {
            if (lastSelected && !lastSelected.hasOwnProperty("isSelected")) {
                lastSelected.target.isSelected = false;
            } else if (lastSelected && lastSelected.hasOwnProperty("isSelected")) {
                lastSelected.isSelected = false;
            }

            if (d.hasOwnProperty("target")) {
                if (lastSelected)
                    $("#jstree").jstree("deselect_node", lastSelected.id);
                d.target.isSelected = true;
                lastSelected = d;               
                refreshDetails(d.target);
                $("#updateDetail,#svDetails").removeAttr("disabled")
                $("#jstree").jstree("select_node", d.target.id);
                // $("#ulDetails").
            } else if (d.hasOwnProperty("isSelected")) {
                if (lastSelected)
                    $("#jstree").jstree("deselect_node", lastSelected.id);
                d.isSelected = true;
                lastSelected = d;               
                refreshDetails(d);
                $("#updateDetail,#svDetails").removeAttr("disabled");
                $("#jstree").jstree("select_node", d.id);
                //$(".clsDetails").remove();
                //if (d.details && d.details.length >= 0) {               
                //    $.each(d.details, function (index, v) {                   
                //        $("#ulDetails ul").append("<li class='clsDetails'>" + v.text + "</li>");
                //    });
                //} 
                //$scope.nodeDetails = d.details;
            }
            update(null,"HighlightLeaf");
        }
    }

    //Details
    //function refreshDetails(selectedNode) {
    //    $("#ulDetails li").remove();
    /*    if (selectedNode.details && selectedNode.details.length >= 0) {
            $.each(selectedNode.details, function (index, v) {
                //lidetails.append("<li>"+v.text+"</li>");
				
                $("#ulDetails").append("<li><div class='clsDetails'><span style='display:inline-block; width:95%'>" + v.createdon + " - " + v.createdby + " </span><span class='edit-details glyphicon glyphicon-pencil' data-node="+selectedNode.id+" data-created="+escape(v.createdon)+" style='cursor:pointer; float:right'></span></div>" + replaceURLWithHyperlinks(v.text) + "</li>");
            });
        }
    }*/

    function refreshDetails(selectedNode) {
        $("#ulDetails li").remove();
        if (selectedNode.details && selectedNode.details.length >= 0) {
            /*$.each(selectedNode.details, function (index, v) {
                //lidetails.append("<li>"+v.text+"</li>");
    
                $("#ulDetails").append("<li><div class='clsDetails'><span style='display:inline-block; width:95%'>" + v.createdon + " - " + v.createdby + " </span><span class='edit-details glyphicon glyphicon-pencil' data-node="+selectedNode.id+" data-created="+escape(v.createdon)+" style='cursor:pointer; float:right'></span></div>" + replaceURLWithHyperlinks(v.text) + "</li>");
            });*/
            var selectedNodeDetails = selectedNode.details[0];
            CKEDITOR.instances['txtDetails'].setData(selectedNodeDetails.text); 
            updateDetailDate = selectedNodeDetails.createdon;
            //selectedNodeName=$(this).data('node');
            $('#svDetails').addClass('hide');
            $('#updateDetail').removeClass('hide');
        } else {
            CKEDITOR.instances['txtDetails'].setData('');
            $('#svDetails').removeClass('hide');
            $('#updateDetail').addClass('hide');
        }
    }
  

    function SelectTreeNode(rootArray, id) {
        if (typeof rootArray != 'undefined') {
            for (var i = 0; i < rootArray.length; i++) {
                if (rootArray[i].id == id) {
                    clickNode(rootArray[i]);
                    return false;
                }
                var a = SelectTreeNode(rootArray[i].children, id);
                if (a != null) {
                   // a.unshift(array[i].id);
                    return a;
                }
            }
        }
        return null;
    }

    //save details
    function SaveDetails(rootArray, id) {
		var gUser = "Jane Doe";
        if (typeof rootArray != 'undefined') {
            for (var i = 0; i < rootArray.length; i++) {
                if (rootArray[i].id == id) {
                    //clickNode(rootArray[i]);
                    if (!rootArray[i].hasOwnProperty("details")) {
                        rootArray[i].details = [];
                    }
                    var details = {
                        //"text": replaceURLWithHyperlinks($("#txtDetails").val()),
                        "text": CKEDITOR.instances['txtDetails'].getData(),
						"createdby": gUser,
						"createdon": getCurrentDatetime()
                    };
                    rootArray[i].details.push(details);
                    return false;
                }
                var a = SaveDetails(rootArray[i].children, id);
                if (a != null) {
                    // a.unshift(array[i].id);
                    return a;
                }
            }
        }
        return null;
    }

   //update details
    function UpdateDetail(rootArray, nodeId, detailCreatedDate){
        if (typeof rootArray != 'undefined') {
            for (var i = 0; i < rootArray.length; i++) {
                if (rootArray[i].id == nodeId) {
                    //clickNode(rootArray[i]);
                    if (rootArray[i].hasOwnProperty("details") && rootArray[i].details.length>0) {
                        var resultObj = rootArray[i].details.filter(function( obj ) {
                            return obj.createdon == detailCreatedDate;
                        });
                        resultObj[0].text=CKEDITOR.instances['txtDetails'].getData();
                        return;
                    }                   
                   
                }
                var a = UpdateDetail(rootArray[i].children, nodeId, detailCreatedDate);
                if (a != null) {
                    // a.unshift(array[i].id);
                    return a;
                }
            }
        }
        return null;
    }
	
    function SaveSubNode(event) {
        if (!ValidateNode())
            return;
        //alert($("txtTitle").val());
        //var a = {};
        var subNode=new nodeProperties();
        var targetNode={};
        targetNode=event.data.param2.target;
        //if (targetNode) {
        //    event.data.param2 = targetNode;
        //}
        //event.data.param2.hassubcategory = true; //set subcategory flag to true
        targetNode.hassubcategory=true; //set subcategory flag to true
        if (targetNode.angletype == "si") {

            subNode.title=$("#txtTitle").val();
            subNode.abstracttext=$("#txtAbstract").val();
            subNode.parentid=targetNode.id;
            subNode.value=angleValue;
            subNode.type="green";
            subNode.level=targetNode.level + 1;
            subNode.angletype="si";
            subNode.posttype="sc";
            subNode.createdFrom=targetNode.id;

        } else if (targetNode.angletype == "di") {

            subNode.title=$("#txtTitle").val();
            subNode.abstracttext=$("#txtAbstract").val();
            subNode.parentid=targetNode.id;
            subNode.value=angleValue;
            subNode.type="green";
            subNode.level=targetNode.level;
            subNode.angletype="si";
            subNode.posttype="sc";
            subNode.createdFrom=targetNode.id;

        } else if (targetNode.angletype == "sd") {

            subNode.title=$("#txtTitle").val();
            subNode.abstracttext=$("#txtAbstract").val();
            subNode.parentid=targetNode.id;
            subNode.value=angleValue;
            subNode.type="green";
            subNode.level=targetNode.level + 1;
            subNode.angletype="sd";
            subNode.posttype="sc";
            subNode.createdFrom=targetNode.id;

        }
        else if (targetNode.angletype == "dd") {

            subNode.title=$("#txtTitle").val();
            subNode.abstracttext=$("#txtAbstract").val();
            subNode.parentid=targetNode.id;
            subNode.value=angleValue;
            subNode.type="green";
            subNode.level=targetNode.level;
            subNode.angletype="sd";
            subNode.posttype="sc";
            subNode.createdFrom=targetNode.id;

        }

        if (targetNode.children) {
            targetNode.push(subNode);
        } else {
            targetNode.children = [subNode];
        }
        
        update(subNode, "subnode");

        SaveTree();

        //update("subnode");
        $('#save-node-popup').hide();     
    }

    function SaveCounterNode(event) {

        if (!ValidateNode())
            return;

        //var a = {};
        var counterNode=new nodeProperties();
        var targetNode={};
        var sourceNode={};
        sourceNode=event.data.param2.source;
        targetNode=event.data.param2.target;
        if (sourceNode) {
            var angleType = targetNode.angletype;
            //event.data.param2 = event.data.param2.source;
            targetNode.hascounterarg = true; //set counter arg flag
          
            if (angleType == "si") {

                counterNode.title=$("#txtTitle").val();
                counterNode.abstracttext=$("#txtAbstract").val();
                counterNode.parentid=sourceNode.id;
                counterNode.value=angleValue;
                counterNode.type="red";
                counterNode.level=sourceNode.level + 1;
                counterNode.angletype="sd";
                counterNode.posttype="ca";
                counterNode.createdFrom=targetNode.id;
            
            } else if (angleType == "sd") {

                counterNode.title=$("#txtTitle").val();
                counterNode.abstracttext=$("#txtAbstract").val();
                counterNode.parentid=sourceNode.id;
                counterNode.value=angleValue;
                counterNode.type="red";
                counterNode.level=sourceNode.level + 1;
                counterNode.angletype="si";
                counterNode.posttype="ca";
                counterNode.createdFrom=targetNode.id;
            }
        }


        if (sourceNode.children) {
            sourceNode.children.push(counterNode);
        } else {
            sourceNode.children = [counterNode];
        }

        update(counterNode,"subnode");
        SaveTree();
        $('#save-node-popup').hide();
    }

    function SaveExpandedCounterNode(event) {
        if (!ValidateNode())
            return;
        var sourceNode=event.data.param2.source;
        var targetNode=event.data.param2.target;
        //var a = {};
        var counterNodeLine=new nodeProperties();
        //if (sourceNode) {
            var targetNodeAngleType = targetNode.angletype;
            //event.data.param2 = event.data.param2.source;
            targetNode.hascounterarg = true; //set divergent flag to true
        
            if (targetNodeAngleType == "si") {

                counterNodeLine.title=$("#txtTitle").val();
                counterNodeLine.abstracttext=$("#txtAbstract").val();
                counterNodeLine.parentid=sourceNode.id;
                counterNodeLine.value=angleValue;
                counterNodeLine.type="grey";
                counterNodeLine.level=sourceNode.level + 1;
                counterNodeLine.angletype="ce";
                counterNodeLine.posttype="ca";
                counterNodeLine.createdFrom=targetNode.id;

            } else if (targetNodeAngleType == "sd") {

                counterNodeLine.title=$("#txtTitle").val();
                counterNodeLine.abstracttext=$("#txtAbstract").val();
                counterNodeLine.parentid=sourceNode.id;
                counterNodeLine.value=angleValue;
                counterNodeLine.type="grey";
                counterNodeLine.level=sourceNode.level + 1;
                counterNodeLine.angletype="ce";
                counterNodeLine.posttype="ca";
                counterNodeLine.createdFrom=targetNode.id;

            }
        //}
        // p = nodes[0];
        if (sourceNode.children) {
            sourceNode.children.push(counterNodeLine);
        } else {
            sourceNode.children = [counterNodeLine];
        }

        update(counterNodeLine);        


        if (sourceNode.children.length - 1) {
            var expcounterNodeData=new nodeProperties();

            expandedCounterNode= sourceNode.children[sourceNode.children.length - 1];
            if (targetNodeAngleType == "si") {

                expcounterNodeData.title=$("#txtTitle").val();
                expcounterNodeData.abstracttext=$("#txtAbstract").val();
                expcounterNodeData.parentid=expandedCounterNode.id;
                expcounterNodeData.value=angleValue;
                expcounterNodeData.type="green";
                expcounterNodeData.level=expandedCounterNode.level + 1;
                expcounterNodeData.angletype="sd";
                expcounterNodeData.posttype="sc";
                expcounterNodeData.createdFrom=expandedCounterNode.id;

            } else if (targetNodeAngleType == "sd") {
                expcounterNodeData.title=$("#txtTitle").val();
                expcounterNodeData.abstracttext=$("#txtAbstract").val();
                expcounterNodeData.parentid=expandedCounterNode.id;
                expcounterNodeData.value=angleValue;
                expcounterNodeData.type="green";
                expcounterNodeData.level=expandedCounterNode.level + 1;
                expcounterNodeData.angletype="si";
                expcounterNodeData.posttype="sc";
                expcounterNodeData.createdFrom=expandedCounterNode.id;
               
            };

            if (expandedCounterNode.children) {
                expandedCounterNode.children.push(expcounterNodeData);
            } else {
                expandedCounterNode.children = [expcounterNodeData];
            }

            update(expcounterNodeData);
            SaveTree();
            $('#save-node-popup').hide();

        }
    }

    function SaveDivergentNode(event) {
        if (!ValidateNode())
            return;

        //var a = {};
        var divergentNodeLine=new nodeProperties();
        var targetNode={};
        var sourceNode={};
        var divergentNode={};
        sourceNode=event.data.param2.source;
        targetNode=event.data.param2.target;
        var diNodeId="NewD" + ++j;
        if (sourceNode) {
            var angleType = targetNode.angletype
            //event.data.param2 = event.data.param2.source;
			targetNode.hasdivergent = true; //set divergent flag to true
			if (angleType == "si") {

			    divergentNodeLine.title=$("#txtTitle").val();
			    divergentNodeLine.abstracttext=$("#txtAbstract").val();
			    divergentNodeLine.parentid=sourceNode.id;
			    divergentNodeLine.value=angleValue;
			    divergentNodeLine.type="grey";
			    divergentNodeLine.level=sourceNode.level;
			    divergentNodeLine.angletype="di";
			    divergentNodeLine.posttype="dg";
			    divergentNodeLine.createdFrom=targetNode.id;

			} else if (angleType == "sd") {

			    divergentNodeLine.title=$("#txtTitle").val();
			    divergentNodeLine.abstracttext=$("#txtAbstract").val();
			    divergentNodeLine.parentid=sourceNode.id;
			    divergentNodeLine.value=angleValue;
			    divergentNodeLine.type="grey";
			    divergentNodeLine.level=sourceNode.level;
			    divergentNodeLine.angletype="dd";
			    divergentNodeLine.posttype="dg";
			    divergentNodeLine.createdFrom=targetNode.id;

                
            }
        }
        // p = nodes[0];
        if (sourceNode.children) {
            sourceNode.children.push(divergentNodeLine);
        } else {
            sourceNode.children = [divergentNodeLine];
        }

        update(divergentNodeLine);        


        if (sourceNode.children.length - 1) {
            var divergentNodeData=new nodeProperties();
            divergentNode= sourceNode.children[sourceNode.children.length - 1];
            if (divergentNode.angletype == "di") {

                divergentNodeData.title=$("#txtTitle").val();
                divergentNodeData.abstracttext=$("#txtAbstract").val();
                divergentNodeData.parentid=divergentNode.id;
                divergentNodeData.value=angleValue;
                divergentNodeData.type="green";
                divergentNodeData.level=divergentNode.level + 1;
                divergentNodeData.angletype="si";
                divergentNodeData.posttype="sc";
                divergentNodeData.createdFrom=divergentNode.id;

            } else if (divergentNode.angletype == "dd") {

                divergentNodeData.title=$("#txtTitle").val();
                divergentNodeData.abstracttext=$("#txtAbstract").val();
                divergentNodeData.parentid=divergentNode.id;
                divergentNodeData.value=angleValue;
                divergentNodeData.type="green";
                divergentNodeData.level=divergentNode.level + 1;
                divergentNodeData.angletype="sd";
                divergentNodeData.posttype="sc";
                divergentNodeData.createdFrom=divergentNode.id;

            };

            if (divergentNode.children) {
                divergentNode.children.push(divergentNodeData);
            } else {
                divergentNode.children = [divergentNodeData];
            }

            update(divergentNodeData);
            SaveTree();
            $('#save-node-popup').hide();

        }

    }

    //Change request
    function updateNode(event) {
        if (!ValidateNode())
            return;
        event.data.param2.target.title = $("#txtTitle").val();
        event.data.param2.target.abstracttext = $("#txtAbstract").val();
        update(event.data.param2.target,"subnode");
        SaveTree();
        $('#save-node-popup').hide();
    }
    //end change request

    //delete leaf and its dependencies
    function deleteLeaf(event){
        update(event.target,"deleteleafnode");
        SaveTree();
       
    }
   
    function SaveTree() {
        DBTreeCls.topic = cloneObject([root])[0];

        $.ajax({
            url: urlDomain + 'updateTree',
            type: 'POST',
            data: JSON.stringify(DBTreeCls),
            contentType: 'application/json',
            success: function (result) {

            }
        })
            
    }



    function findObjectById(rootTree, id, childObj) {
        if (rootTree.children) {
            //for (var k in root.children) {
            $.each(rootTree.children, function (index, item) {
                if (item.id == id) {
                    item.children = [];
                    item.children.push(childObj)

                }
                else if(item.childern){
                    findObjectById(item.children, id, childObj);
                }
            })
                
            }
        }
  
	
	function getCurrentDatetime(){
	    //Returns the current datetime in the standard format
		var currentdate = new Date();
		var yr = currentdate.getFullYear();
		var mth = ("00" + (currentdate.getMonth()+1)).slice(-2);
		var dt =   ("00" + currentdate.getDate()).slice(-2);  
		var hrs = currentdate.getHours();
		var mins = currentdate.getMinutes();
		var ampm;

		if (hrs > 11){
			ampm = "PM";
		} else {
			ampm = "AM";
		}

		var currentdatetime = yr + "-" + mth + "-" + dt + " " +  ("00" + hrs).slice(-2) + ":" + ("00" + mins).slice(-2) + ":" + ("00" + currentdate.getSeconds()).slice(-2) + " " + ampm;
		return currentdatetime;
	};
	
	function replaceURLWithHyperlinks(theText) {
	    //Identifies the potential url address in the incoming string and 
		//replace the url strings with Hyperlinks
		
		var txtString = theText;
		var exp = /(\b(((https?|ftp|file|):\/\/)|www[.])[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
		var temp = txtString.replace(exp,"<a href=\"$1\" target=\"_blank\">$1</a>");
		var result = "";

		while (temp.length > 0) {
			var pos = temp.indexOf("href=\"");
			if (pos == -1) {
				result += temp;
				break;
			}
			result += temp.substring(0, pos + 6);

			temp = temp.substring(pos + 6, temp.length);
			if ((temp.indexOf("://") > 8) || (temp.indexOf("://") == -1)) {
				result += "http://";
			}
		}

		return result;	
	}

    //#Item 3 changes
    //Scales popup functionality
	$("#addScales").click(function () {
	    $("#scalesPopup").css("display", "block");
	})

	

	scalesData = {
	    id: "",
	    solutionDescriptors: "",
	    problemDescriptors: "",
	    solutionStandardScale: "",
	    solutionDampeningScale: ""
	    //problemStandardScale: "",
	    //problemDampeningScale: ""
	}

    //retrieve scale descriptors  
	$.ajax({
	    url: urlDomain + 'getScalesDescriptors',
	    type: "GET",
	    contentType: "json",
	    success: function (retTree) {
	        if (retTree.length == 0)
	            return false;

	        if (retTree.length >= 1) {
	            scalesData.id = retTree[0]._id;
	            if (retTree[0].solutionDescriptors != undefined) {
	                scalesData.solutionDescriptors = retTree[0].solutionDescriptors;
	                if(scalesData.solutionDescriptors.Effectiveness.length > 5 && scalesData.solutionDescriptors.Feasibility.length > 5){
	                    fillSolutionDescriptors(scalesData.solutionDescriptors.Effectiveness, scalesData.solutionDescriptors.Feasibility);
	                }
	            }
	            if (retTree[0].problemDescriptors != undefined) {
	                scalesData.problemDescriptors = retTree[0].problemDescriptors;
	                if(scalesData.problemDescriptors.Severity.length > 5 && scalesData.problemDescriptors.Plausibility.length > 5){
	                    fillProblemDescriptors(scalesData.problemDescriptors.Severity, scalesData.problemDescriptors.Plausibility);
	                }
	            }
	           
	            
	           
	            //bind scales- kc
	            //if (retTree[0].standardScale || retTree[0].dampeningScale) {
	            //    bindSolutionScales(retTree[0].standardScale, retTree[0].dampeningScale);
	            //}
	            //createTable(retTree);
	            //bind scale descriptors

	        }
	    }
	});
	

	$("#solutionCancel, #problemCancel").click(function () {
	    $("#scalesPopup").css("display", "none");
	})

    //save global solution descriptors
	$("#saveSolution").click(function () {
	    if (!ValidateSolutionDescriptors())
	        return;

	    //save
	    scalesData.solutionDescriptors = {
	        "Effectiveness": [$("#txt10Effectiveness").val(),$("#txt9Effectiveness").val(),$("#txt8Effectiveness").val(),$("#txt7Effectiveness").val(),$("#txt6Effectiveness").val(),$("#txt5Effectiveness").val(), $("#txt4Effectiveness").val(), $("#txt3Effectiveness").val(), $("#txt2Effectiveness").val(), $("#txt1Effectiveness").val()],
	        "Feasibility": [$("#txt10Feasibility").val(),$("#txt9Feasibility").val(),$("#txt8Feasibility").val(),$("#txt7Feasibility").val(),$("#txt6Feasibility").val(),$("#txt5Feasibility").val(), $("#txt4Feasibility").val(), $("#txt3Feasibility").val(), $("#txt2Feasibility").val(), $("#txt1Feasibility").val()]
	        //"5": $("#txt5Effectiveness").val(),
	        //"4": $("#txt4Effectiveness").val(),
	        //"3": $("#txt3Effectiveness").val(),
	        //"2": $("#txt2Effectiveness").val(),
	        //"1": $("#txt1Effectiveness").val(),

	    };
	    scalesData.solutionStandardScale = [parseInt($("#txt1SS").val()), parseInt($("#txt2SS").val()), parseInt($("#txt3SS").val()), parseInt($("#txt4SS").val()), parseInt($("#txt5SS").val()),parseInt($("#txt6SS").val()),parseInt($("#txt7SS").val()),parseInt($("#txt8SS").val()),parseInt($("#txt9SS").val()),parseInt($("#txt10SS").val())];
	    scalesData.solutionDampeningScale = [parseInt($("#txt1SD").val()), parseInt($("#txt2SD").val()), parseInt($("#txt3SD").val()), parseInt($("#txt4SD").val()), parseInt($("#txt5SD").val()),parseInt($("#txt6SD").val()),parseInt($("#txt7SD").val()),parseInt($("#txt8SD").val()),parseInt($("#txt9SD").val()),parseInt($("#txt10SD").val())];
	    //ajax call
	    $.ajax({
	        url: urlDomain + 'upsertSolutionDescriptors',
	        type: "POST",
	        data: JSON.stringify(scalesData),
	        contentType: "application/json",
	        success: function (retTree) {	         
	            if (retTree && retTree.resp) {
	                if (retTree.resp != 1) {
	                    scalesData.id = retTree.resp._id;
	                    scalesData.solutionDescriptors = retTree.resp.solutionDescriptors;
	                    scalesData.solutionStandardScale = retTree.resp.standardScale;
	                    scalesData.solutionDampeningScale = retTree.resp.dampeningScale;
	                    fillSolutionDescriptors(retTree.resp.solutionDescriptors.Effectiveness, retTree.resp.solutionDescriptors.Feasibility);
	                    bindSolutionScales(retTree.resp.standardScale, retTree.resp.dampeningScale);
	                } else if (retTree.resp == 1) {
	                    items = [$("#txt10Effectiveness").val(),$("#txt9Effectiveness").val(),$("#txt8Effectiveness").val(),$("#txt7Effectiveness").val(),$("#txt6Effectiveness").val(),$("#txt5Effectiveness").val(), $("#txt4Effectiveness").val(), $("#txt3Effectiveness").val(), $("#txt2Effectiveness").val(), $("#txt1Effectiveness").val()];
	                    items2 = [$("#txt10Feasibility").val(),$("#txt9Feasibility").val(),$("#txt8Feasibility").val(),$("#txt7Feasibility").val(),$("#txt6Feasibility").val(),$("#txt5Feasibility").val(), $("#txt4Feasibility").val(), $("#txt3Feasibility").val(), $("#txt2Feasibility").val(), $("#txt1Feasibility").val()],
	                    bindSolutionDescriptors();
	                }
	            }
	            $("#scalesPopup").css("display", "none");
	        }
	    });
	    });

	$("#saveProblem").click(function () {
	    if (!ValidateProblemDescriptors())
	        return;

	    //save
	    scalesData.problemDescriptors = {
	        "Severity": [$("#txt10Severity").val(),$("#txt9Severity").val(),$("#txt8Severity").val(),$("#txt7Severity").val(),$("#txt6Severity").val(),$("#txt5Severity").val(), $("#txt4Severity").val(), $("#txt3Severity").val(), $("#txt2Severity").val(), $("#txt1Severity").val()],
	        "Plausibility": [$("#txt10Plausibility").val(),$("#txt9Plausibility").val(),$("#txt8Plausibility").val(),$("#txt7Plausibility").val(),$("#txt6Plausibility").val(),$("#txt5Plausibility").val(), $("#txt4Plausibility").val(), $("#txt3Plausibility").val(), $("#txt2Plausibility").val(), $("#txt1Plausibility").val()]
	        //"5": $("#txt5Effectiveness").val(),
	        //"4": $("#txt4Effectiveness").val(),
	        //"3": $("#txt3Effectiveness").val(),
	        //"2": $("#txt2Effectiveness").val(),
	        //"1": $("#txt1Effectiveness").val(),

	    };
	    //ajax call
	    $.ajax({
	        url: urlDomain + 'upsertProblemDescriptors',
	        type: "POST",
	        data: JSON.stringify(scalesData),
	        contentType: "application/json",
	        success: function (retTree) {

	            if (retTree && retTree.resp) {
	                if (retTree.resp != 1) {
	                    scalesData.id = retTree.resp._id;
	                    scalesData.problemDescriptors = retTree.resp.problemDescriptors;
	                    fillProblemDescriptors(retTree.resp.problemDescriptors.Severity, retTree.resp.solutionDescriptors.Plausibility);
	                } else if (retTree.resp == 1) {
	                    items3 = [$("#txt10Severity").val(),$("#txt9Severity").val(),$("#txt8Severity").val(),$("#txt7Severity").val(),$("#txt6Severity").val(),$("#txt5Severity").val(), $("#txt4Severity").val(), $("#txt3Severity").val(), $("#txt2Severity").val(), $("#txt1Severity").val()],
	                    items4 = [$("#txt10Plausibility").val(),$("#txt9Plausibility").val(),$("#txt8Plausibility").val(),$("#txt7Plausibility").val(),$("#txt6Plausibility").val(),$("#txt5Plausibility").val(), $("#txt4Plausibility").val(), $("#txt3Plausibility").val(), $("#txt2Plausibility").val(), $("#txt1Plausibility").val()],
	                    bindProblemDescriptors();
	                }

	                ///scalesData.problemDescriptors=retTree.p
	            }
	            $("#scalesPopup").css("display", "none");
	        }
	    });
	})

    //hide context menu when click outside the container
	$(document).mouseup(function(event) { 
	    if(!$(event.target).closest('.d3-context-menu').length) {
	        if($('.d3-context-menu').is(":visible")) {
	            d3.select('.d3-context-menu').style("display","none");
	        }
	    }        
	});

    //
	function fillSolutionDescriptors(Effectiveness, Feasibility) {
        //effectiveness
	    $("#txt1Effectiveness").val(Effectiveness[9]);
	    $("#txt2Effectiveness").val(Effectiveness[8]);
	    $("#txt3Effectiveness").val(Effectiveness[7]);
	    $("#txt4Effectiveness").val(Effectiveness[6]);
	    $("#txt5Effectiveness").val(Effectiveness[5]);
	    $("#txt6Effectiveness").val(Effectiveness[4]);
	    $("#txt7Effectiveness").val(Effectiveness[3]);
	    $("#txt8Effectiveness").val(Effectiveness[2]);
	    $("#txt9Effectiveness").val(Effectiveness[1]);
	    $("#txt10Effectiveness").val(Effectiveness[0]);
	    //feasibility
	    $("#txt1Feasibility").val(Feasibility[9]);
	    $("#txt2Feasibility").val(Feasibility[8]);
	    $("#txt3Feasibility").val(Feasibility[7]);
	    $("#txt4Feasibility").val(Feasibility[6]);
	    $("#txt5Feasibility").val(Feasibility[5]);
	    $("#txt6Feasibility").val(Feasibility[4]);
	    $("#txt7Feasibility").val(Feasibility[3]);
	    $("#txt8Feasibility").val(Feasibility[2]);
	    $("#txt9Feasibility").val(Feasibility[1]);
	    $("#txt10Feasibility").val(Feasibility[0]);


	    //var items = ['Genius [Transformational]', 'Smart / Novel [Progressive]', 'Standard [Status Quo]', 'Potential Neg. Effect', 'Negative Effect [Unethical]'];
	    //var items2 = ['Doable Today', 'Doable w/ Assistance', 'Plausible', 'Science Fiction', 'Impossible'];
	    // CR7: part1 - END	   
	    //items.length = 0;
	    //items2.length = 0;
	    items = Effectiveness;
	    items2 = Feasibility;
	    bindSolutionDescriptors();
	}

    

	function fillProblemDescriptors(Severity, Plausibility) {
	    //effectiveness
	    $("#txt1Severity").val(Severity[9]);
	    $("#txt2Severity").val(Severity[8]);
	    $("#txt3Severity").val(Severity[7]);
	    $("#txt4Severity").val(Severity[6]);
	    $("#txt5Severity").val(Severity[5]);
	    $("#txt6Severity").val(Severity[4]);
	    $("#txt7Severity").val(Severity[3]);
	    $("#txt8Severity").val(Severity[2]);
	    $("#txt9Severity").val(Severity[1]);
	    $("#txt10Severity").val(Severity[0]);
	    //feasibility
	    $("#txt1Plausibility").val(Plausibility[9]);
	    $("#txt2Plausibility").val(Plausibility[8]);
	    $("#txt3Plausibility").val(Plausibility[7]);
	    $("#txt4Plausibility").val(Plausibility[6]);
	    $("#txt5Plausibility").val(Plausibility[5]);
	    $("#txt6Plausibility").val(Plausibility[4]);
	    $("#txt7Plausibility").val(Plausibility[3]);
	    $("#txt8Plausibility").val(Plausibility[2]);
	    $("#txt9Plausibility").val(Plausibility[1]);
	    $("#txt10Plausibility").val(Plausibility[0]);

	    // Range Slider Problems Start//
	    // CR7: part2 - START
	    //var items3 = ['Immense Problem [Fatal]', 'Huge Problem [Illegal]', 'Bad [Harmful to Reputation]', 'Unfair', 'No Problem'];
	    //var items4 = ['100% Chance', 'High Likelihood', '50% Chance', 'Unlikely', '0% Chance'];
	    // CR7: part2 - END
	    //items3.length = 0;
	    //items3.length = 0;
	    items3 = Severity;
	    items4 = Plausibility;
	    bindProblemDescriptors();
	   
	}

	function bindSolutionDescriptors() {
	   
	    var s = $(".slider");
	    s.slider({
	        value: 1,
	        step: 1,
	        min: 1,
	        max: items.length,
	        orientation: "vertical"
	    });

	    $(".effectiveness").empty();
	    $(".feasibility").empty();
	    var oneBig = 100 / (items.length);

	    $.each(items, function (key, value) {
	        var w = oneBig;
	        if (key === 0 || key === items.length - 1)
	            w = oneBig / 2;
	        $(".effectiveness").append("<label style='height: " + w + "%'><span>" + value + "</span></laben>");
	    });

	    $.each(items2, function (key, value) {
	        var w = oneBig;
	        if (key === 0 || key === items.length - 1)
	            w = oneBig / 2;
	        $(".feasibility").append("<label style='height: " + w + "%'><span>" + value + "</span></laben>");
	    });
	}

	function bindProblemDescriptors() {
	    var s = $(".slider1");

	    s.slider({
	        value: 1,
	        step: 1,
	        min: 1,
	        max: items3.length,
	        orientation: "vertical"
	    });
	    $(".serverity").empty();
	    $(".plausibility").empty();
	    var oneBig = 100 / (items3.length);

	    $.each(items3, function (key, value) {
	        var w = oneBig;
	        if (key === 0 || key === items3.length - 1)
	            w = oneBig / 2;
	        $(".serverity").append("<label style='height: " + w + "%'><span>" + value + "</span></laben>");
	    });
	    $.each(items4, function (key, value) {
	        var w = oneBig;
	        if (key === 0 || key === items3.length - 1)
	            w = oneBig / 2;
	        $(".plausibility").append("<label style='height: " + w + "%'><span>" + value + "</span></laben>");
	    });

	    // Range Slider End ///
	}
    
	function bindSolutionScales(standardScales, dampeningScales) {
	 
	    votingScale = standardScales;
	    votingDampeningScale = dampeningScales;

	    //bind textboxes
	    $("#txt1SS").val(standardScales[0]);
	    $("#txt2SS").val(standardScales[1]);
	    $("#txt3SS").val(standardScales[2]);
	    $("#txt4SS").val(standardScales[3]);
	    $("#txt5SS").val(standardScales[4]);
	    $("#txt6SS").val(standardScales[5]);
	    $("#txt7SS").val(standardScales[6]);
	    $("#txt8SS").val(standardScales[7]);
	    $("#txt9SS").val(standardScales[8]);
	    $("#txt10SS").val(standardScales[9]);

	    $("#txt1SD").val(dampeningScales[0]);
	    $("#txt2SD").val(dampeningScales[1]);
	    $("#txt3SD").val(dampeningScales[2]);
	    $("#txt4SD").val(dampeningScales[3]);
	    $("#txt5SD").val(dampeningScales[4]);
	    $("#txt6SD").val(dampeningScales[5]);
	    $("#txt7SD").val(dampeningScales[6]);
	    $("#txt8SD").val(dampeningScales[7]);
	    $("#txt9SD").val(dampeningScales[8]);
	    $("#txt10SD").val(dampeningScales[9]);

	}

	if (votingScale && votingScale.length<=5) {
	    //votingScale = [16, 32, 48, 64, 80, 96, 112, 128, 144, 160]; //Standard voting scale for both Solutions & Problems
	    //votingDampeningScale = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]; //Solution's Dampening scale
	
	    votingScale = [10,20,30,40,50,60,70,80,90,100]; //Standard voting scale for both Solutions & Problems
	    votingDampeningScale = [10,20,30,40,50,60,70,80,90,100]; //Solution's Dampening scale

	    bindSolutionScales(votingScale, votingDampeningScale);

	}

	if (items.length <= 5) {
        //default values
	    items = ['Dissolve (eliminate future occurrences)', 'Certain to work every time', 'Works most of the time', 'A potential solution','Partial resolution','Band aid','Could work','Placebo','Ineffective','Makes situation worse'];
	    items2 = ['Doable now', 'High likelihood of success', 'Doable with assistance', 'Likely to work', 'Better than even odds','Even odds of success','Plausible','Not likely','Science fiction','Impossible'];
	    bindSolutionDescriptors();
	    fillSolutionDescriptors(items, items2);
      
	}

	if (items3.length <= 5) {
	    //default values
	    items3 = ['Fatal', 'Immense Problem', 'Unethical', 'Ilegal', 'Huge problem','Harmful to others','Harmful to reputation','Unfair to others','Bad','No problem'];
	    items4 = ['100% Chance', 'Highly likely', 'Very good chance', 'Probable', 'Likely','50% chance','Decent probability','Probably not','Little chance','0% chance'];
	    bindProblemDescriptors();
	    fillProblemDescriptors(items3, items4);
	}

   //Validate
	function ValidateSolutionDescriptors() {
	    if ($("#txt1Effectiveness").val() == "undefined" || $("#txt1Effectiveness").val().trim() == ""
            || $("#txt2Effectiveness").val() == "undefined" || $("#txt2Effectiveness").val().trim() == ""
            || $("#txt3Effectiveness").val() == "undefined" || $("#txt3Effectiveness").val().trim() == ""
            || $("#txt4Effectiveness").val() == "undefined" || $("#txt4Effectiveness").val().trim() == ""
            || $("#txt5Effectiveness").val() == "undefined" || $("#txt5Effectiveness").val().trim() == ""
            || $("#txt6Effectiveness").val() == "undefined" || $("#txt6Effectiveness").val().trim() == ""
            || $("#txt7Effectiveness").val() == "undefined" || $("#txt7Effectiveness").val().trim() == ""
            || $("#txt8Effectiveness").val() == "undefined" || $("#txt8Effectiveness").val().trim() == ""
            || $("#txt9Effectiveness").val() == "undefined" || $("#txt9Effectiveness").val().trim() == ""
            || $("#txt10Effectiveness").val() == "undefined" || $("#txt10Effectiveness").val().trim() == ""
            || $("#txt1Feasibility").val() == "undefined" || $("#txt1Feasibility").val().trim() == ""
            || $("#txt2Feasibility").val() == "undefined" || $("#txt2Feasibility").val().trim() == ""
            || $("#txt3Feasibility").val() == "undefined" || $("#txt3Feasibility").val().trim() == ""
            || $("#txt4Feasibility").val() == "undefined" || $("#txt4Feasibility").val().trim() == ""
            || $("#txt5Feasibility").val() == "undefined" || $("#txt5Feasibility").val().trim() == ""
            || $("#txt6Feasibility").val() == "undefined" || $("#txt6Feasibility").val().trim() == ""
            || $("#txt7Feasibility").val() == "undefined" || $("#txt7Feasibility").val().trim() == ""
            || $("#txt8Feasibility").val() == "undefined" || $("#txt8Feasibility").val().trim() == ""
            || $("#txt9Feasibility").val() == "undefined" || $("#txt9Feasibility").val().trim() == ""
            || $("#txt10Feasibility").val() == "undefined" || $("#txt10Feasibility").val().trim() == "") {
	        alert("Please enter all descriptors");
	        return false;
	    }
	    if ($("#txt10SS").val() == "undefined" || $("#txt10SS").val().trim() == ""
            ||$("#txt9SS").val() == "undefined" || $("#txt9SS").val().trim() == ""
            ||$("#txt8SS").val() == "undefined" || $("#txt8SS").val().trim() == ""
            ||$("#txt7SS").val() == "undefined" || $("#txt7SS").val().trim() == ""
            ||$("#txt6SS").val() == "undefined" || $("#txt6SS").val().trim() == ""
            ||$("#txt5SS").val() == "undefined" || $("#txt5SS").val().trim() == ""
            || $("#txt4SS").val() == "undefined" || $("#txt4SS").val().trim() == ""
            || $("#txt3SS").val() == "undefined" || $("#txt3SS").val().trim() == ""
            || $("#txt2SS").val() == "undefined" || $("#txt2SS").val().trim() == ""
            || $("#txt1SS").val() == "undefined" || $("#txt1SS").val().trim() == ""
            || $("#txt10SD").val() == "undefined" || $("#txt10SD").val().trim() == ""
            || $("#txt9SD").val() == "undefined" || $("#txt9SD").val().trim() == ""
            || $("#txt8SD").val() == "undefined" || $("#txt8SD").val().trim() == ""
            || $("#txt7SD").val() == "undefined" || $("#txt7SD").val().trim() == ""
            || $("#txt6SD").val() == "undefined" || $("#txt6SD").val().trim() == ""
            || $("#txt5SD").val() == "undefined" || $("#txt5SD").val().trim() == ""
            || $("#txt4SD").val() == "undefined" || $("#txt4SD").val().trim() == ""
            || $("#txt3SD").val() == "undefined" || $("#txt3SD").val().trim() == ""
            || $("#txt2SD").val() == "undefined" || $("#txt2SD").val().trim() == ""
            || $("#txt1SD").val() == "undefined" || $("#txt1SD").val().trim() == "") {
	        alert("Please enter all scales");
	        return false;
	    }
	    return true;
	}

    //Validate
	function ValidateProblemDescriptors() {
	    if ($("#txt10Severity").val() == "undefined" || $("#txt10Severity").val().trim() == ""
            ||$("#txt9Severity").val() == "undefined" || $("#txt9Severity").val().trim() == ""
            ||$("#txt8Severity").val() == "undefined" || $("#txt8Severity").val().trim() == ""
            ||$("#txt7Severity").val() == "undefined" || $("#txt7Severity").val().trim() == ""
            ||$("#txt6Severity").val() == "undefined" || $("#txt6Severity").val().trim() == ""
            ||$("#txt5Severity").val() == "undefined" || $("#txt5Severity").val().trim() == ""
            || $("#txt4Severity").val() == "undefined" || $("#txt4Severity").val().trim() == ""
            || $("#txt3Severity").val() == "undefined" || $("#txt3Severity").val().trim() == ""
            || $("#txt2Severity").val() == "undefined" || $("#txt2Severity").val().trim() == ""
            || $("#txt1Severity").val() == "undefined" || $("#txt1Severity").val().trim() == ""
            || $("#txt1Plausibility").val() == "undefined" || $("#txt1Plausibility").val().trim() == ""
            || $("#txt2Plausibility").val() == "undefined" || $("#txt2Plausibility").val().trim() == ""
            || $("#txt3Plausibility").val() == "undefined" || $("#txt3Plausibility").val().trim() == ""
            || $("#txt4Plausibility").val() == "undefined" || $("#txt4Plausibility").val().trim() == ""
            || $("#txt5Plausibility").val() == "undefined" || $("#txt5Plausibility").val().trim() == ""
            || $("#txt6Plausibility").val() == "undefined" || $("#txt6Plausibility").val().trim() == ""
            || $("#txt7Plausibility").val() == "undefined" || $("#txt7Plausibility").val().trim() == ""
            || $("#txt8Plausibility").val() == "undefined" || $("#txt8Plausibility").val().trim() == ""
            || $("#txt9Plausibility").val() == "undefined" || $("#txt9Plausibility").val().trim() == ""
            || $("#txt10Plausibility").val() == "undefined" || $("#txt10Plausibility").val().trim() == "") {
	        alert("Please enter all descriptors");
	        return false;
	    }
	    return true;
	}
})

function nodeProperties(){

        this.parentid = "",
        this.title = "",
        this.abstracttext = "",
        this.value = "",
        this.type = "",
        this.icon = "assets/images/leaf-green.png",
        this.angletype = "",
        this.level = "",
        this.posttype = "",
        this.id = (new Date()).getTime(),
        this.isSelected = false,
        this.votecount = 0,
        this.votequalsum = 0,
        this.votequansum = 0,
        this.hassubcategory = false,
        this.hascounterarg = false,
        this.hasdivergent = false,
        this.createdFrom = ""
}