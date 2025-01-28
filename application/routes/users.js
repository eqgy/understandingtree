var express = require('express');
var router = express.Router();

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });


router.get('/topiclist', function(req, res) {
	//console.log("this is get");
    var db = req.db;
    var collection = db.get('topiclist');
    collection.find({}, {}, function (e, docs) {
        res.json(docs);
    });
    //collection.find({ topic: {$exists:true}},{},function(e,docs){
    //    res.json(docs);
    //});
    //collection.find({ _id: "55decfea709c49c0315cef37" }, {}, function (e, docs) {
    //        res.json(docs);
    //    })
});

router.get('/topicById/:topicId?', function (req, res) {
    console.log(req.params.topicId);
    var db = req.db;
    var collection = db.get('userlist');
    //var whereTopicId = "this.topciId="+req.params.topicId;

    collection.find({ "topicId": req.params.topicId }, {}, function (e, docs) {
        res.json(docs);
    });
    //collection.find({ topic: {$exists:true}},{},function(e,docs){
    //    res.json(docs);
    //});
    //collection.find({ _id: "55decfea709c49c0315cef37" }, {}, function (e, docs) {
    //        res.json(docs);
    //    })
});

router.get('/getTopics', function (req, res) {
    //console.log("this is get");55f7f28a8a17c16c1fcde654
    var db = req.db;
    var collection = db.get('userlist');    
    collection.find({ }, function (e, docs) {
        if (e == null) {
            console.log(docs);
            res.json(docs);
        }else res.send(e);
    });    
  
});


/*
 * POST to adduser.
 */
router.post('/addNode', function(req, res) {
	console.log(req.body.topic);
    var db = req.db;
    var collection = db.get('userlist');

    collection.insert(req.body, function (err, result) {

        //if (err == null) {
        //    collection.find({}, {}, function (e, docs) {
        //        res.json(docs);
        //    });
        //}

       res.send(
           (err === null) ? { msg: result } : { msg: err }
        );
    });
 //res.send('respond with a resource');
});


/*
 * POST to addTopic.
 */
router.post('/addTopic', function (req, res) {
    console.log(req.body);
    var db = req.db;
    var collection = db.get('topiclist');
    collection.insert(req.body, function (err, result) {
        if (err == null) {
            //insert intial node in 
            var topics = db.get('userlist');
            console.log(result._id.toString());
            var treeData = {
                "topicId": result._id.toString(),
                "topic": {
                    "id": "T1",
                    "title": "Topic",
                    "value": 5,
                    "topictype": "question",
                    "objtype": "topic",
                    "level": 0,// which depth it belongs to
                    "angletype": "root",
                    //"parent": "null",
                    "hassubcategory": false,
                    "hascounterarg": false,// 45 degrees                   
                    "hasdivergent": false,
                    "children": [
                    {
                        "id": "N2",
                        "objtype": "post",
                        "title": result.topic,
                        "parentid": "T1",
                        "type": "grey",
                        "posttype": "sc",
                        "votecount": "0",
                        "abstracttext": result.category,
                        "createdby": "Jane Doe",
                        "createdon": "2015-07-01 10:10:30 AM",
                        "modifiedby": "Jane Doe",
                        "modifiedon": "2015-07-02 10:10:30 AM",
                        "angletype": "sd",
                        "level": 1,
                        "isSelected": false,
                        "value": 5,
                        "votequalsum": 0,
                        "votequansum": 0,
                        "hassubcategory": false,
                        "hascounterarg": false,// 45 degrees                            
                        "hasdivergent": false
                    }]

                }
            }
            console.log(treeData);
            topics.insert(treeData, function (err, result) {
                if (err == null) {
                    collection.find({}, {}, function (e, docs) {
                        res.json(docs);
                    });
                }
               
            });
            
           
        }
    });
    //res.send('respond with a resource');
});

//remove document
router.post('/removeNode', function (req, res) {
    //console.log("this is post");
    var db = req.db;
    var collection = db.get('userlist');

    //collection.remove(
    //        { _id: new mongodb.ObjectID(req.body) },
    //        function (err, result) {
    //            //check result to see how many document are deleted
    //        });
    collection.remove({ _id: req.body.id }, function (err, result) {
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
         );
    });
    //res.send('respond with a resource');
});

router.post('/removeTopics', function (req, res) {
    //console.log("this is post");
    var db = req.db;
    var collection = db.get('topiclist');
    
    collection.remove({}, function (err, result) {
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
         );
    });
    //res.send('respond with a resource');
});

router.post('/removeTopicById', function (req, res) {
    var db = req.db;
    var collection = db.get('userlist');
    collection.remove({ "topicId": req.body.topicId }, function (err, result) {
        if(err===null){
            var topicDb = req.db;
            var topicCollection = topicDb.get('topiclist');
            topicCollection.remove({ _id: req.body.topicId }, function (err, result) {
				if (err == null) {						
					topicCollection.find({}, {}, function (e, docs) {
						res.json(docs);
					});
				} else {
					res.send('9999');
				}
            });
        }
    });
});


//remove documents
router.post('/remove', function (req, res) {
    //console.log("this is post");
    var db = req.db;
    var collection = db.get('userlist');

    //collection.remove(
    //        { _id: new mongodb.ObjectID(req.body) },
    //        function (err, result) {
    //            //check result to see how many document are deleted
    //        });
    collection.remove({}, function (err, result) {
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
         );
    });
    //res.send('respond with a resource');
});

router.post('/updateTree', function (req, res) {
    console.log(req.body);
    var db = req.db;
    var collection = db.get('userlist');

    console.log(req.body);


    collection.update({ _id: req.body.id }, { $set: { topic: req.body.topic } }, function (err, result) {
        res.send(
            (err === null) ? { msg: 1 } : { msg: err }
         );
    });
});

router.get('/getScalesDescriptors', function (req, res) {
    var db = req.db;
    var collection = db.get('scaledescriptors');
    collection.find({}, function (e, docs) {
        if (e == null) {
            console.log(docs);
            res.json(docs);
        } else res.send(e);
    });
})

router.post('/upsertSolutionDescriptors', function (req, res) {
    console.log(req.body);
    var db = req.db;
    var descriptors = db.get('scaledescriptors');
    var scaleDescriptors = {
        //id:req.body.id,
        solutionDescriptors:req.body.solutionDescriptors,
        standardScale:req.body.solutionStandardScale,
        dampeningScale:req.body.solutionDampeningScale
        ///problemDescriptors:req.body.problemDescriptors
    }            
           
    if (req.body.id) {
        descriptors.update({ _id: req.body.id }, { $set: { solutionDescriptors: scaleDescriptors.solutionDescriptors, standardScale: scaleDescriptors.standardScale, dampeningScale: scaleDescriptors.dampeningScale } }, function (err, result) {
            res.send(
                (err === null) ? { resp:result } : { msg: err }
             );
        });
    }else{
        descriptors.insert(scaleDescriptors, function (err, result) {
            res.send(
                (err === null) ? { resp: result } : { msg: err }
             );
        });
    }
   
})

router.post('/upsertProblemDescriptors', function (req, res) {
    console.log(req.body);
    var db = req.db;
    var descriptors = db.get('scaledescriptors');
    var scaleDescriptors = {
        //id:req.body.id,
        problemDescriptors: req.body.problemDescriptors
        ///problemDescriptors:req.body.problemDescriptors
    }

    if (req.body.id) {
        descriptors.update({ _id: req.body.id }, { $set: { problemDescriptors: scaleDescriptors.problemDescriptors } }, function (err, result) {
            res.send(
                (err === null) ? { resp: result } : { msg: err }
             );
        });
    } else {
        descriptors.insert(scaleDescriptors, function (err, result) {
            res.send(
                (err === null) ? { resp: result } : { msg: err }
             );
        });
    }

})


module.exports = router;
