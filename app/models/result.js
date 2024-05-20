var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
const raceSchema = require('./race').schema
// const memberSchema = require('./member').schema

var SystemInfo = require('./systeminfo');



// define the schema for our user model
var resultSchema = mongoose.Schema({
    time: Number,
    ranking: {
        agerank: Number,
        agetotal: Number,
        genderrank: Number,
        gendertotal: Number,
        overallrank: Number,
        overalltotal: Number
    },
    members: [{
        _id: mongoose.Schema.ObjectId,
        firstname: String,
        lastname: String,
        sex: String,
        dateofbirth: Date
    }],
    race: raceSchema,
    legs:[{ //for multisport
        order:Number,
        legName:String,
        legType:String, //run,swim,bike
        time: Number,
        meters: Number,
        miles: Number,
        distanceName: String,
        isTransition:Boolean
    }],
    category: String,
    comments: String,
    resultlink: String,
    agegrade: Number,
    isRecordEligible: Boolean,
    is_accepted: Boolean,
    customOptions:[{
      name:String,
      value:String,
      text:String,
      width:String,
      height:String
    }],
    createdAt: Date,
    updatedAt: Date

});

// var resultSchema = mongoose.Schema({
//     race:{
//         _id: mongoose.Schema.ObjectId,
//         racename: String,
//         racetype: {
//             _id: mongoose.Schema.ObjectId,
//             name: String,
//             surface: String,
//             meters: Number,
//             miles: Number,
//             isVariable: Boolean
//         },
//         racedate: Date
//     },
//     time: Number,
//     ranking: {
//         agerank: Number,
//         agetotal: Number,
//         genderrank: Number,
//         gendertotal: Number,
//         overallrank: Number,
//         overalltotal: Number
//     },
//     members: [{
//         _id: mongoose.Schema.ObjectId,
//         firstname: String,
//         lastname: String,
//         sex: String,
//         dateofbirth: Date
//     }],
//     category: String,
//     comments: String,
//     resultlink: String,
//     agegrade: Number,
//     is_accepted: Boolean,
//     createdAt: Date,
//     updatedAt: Date

// });

// keep track of when results are updated and created
resultSchema.post('save', function(doc, next) {
    var date = Date.now();
    if (this.isNew) {
        this.createdAt = date;
    }
    this.updatedAt = date;
    this.updateCategory();
    this.updateSystemInfo('mcrrc',date);
    next();
});

//or deleted
resultSchema.post('deleteOne', function(doc, next) {
    var date = Date.now();
    if (this.isNew) {
        this.createdAt = date;
    }
    this.updatedAt = date;    
    resultSchema.methods.updateSystemInfo('mcrrc',date);
    next();
}); 


//check category of result after a save
resultSchema.methods.updateCategory = function() {
    var membersLength = this.members.length;
    var isOpen = false;
    for (var i = 0; i < membersLength; i++) {
        if (getAddDateToDate(this.race.racedate, -40, 0, 0) < this.members[i].dateofbirth) {
            isOpen = true;
            break;
        }
    }
    if (isOpen) {
        this.category = "Open";
    } else {
        this.category = "Master";
    }
};

resultSchema.methods.updateSystemInfo = function(name,date) {
    try{
        SystemInfo.findOne({
            name: name
        }).then(systemInfo =>{
            if (systemInfo) {
                systemInfo.resultUpdate = date;
                systemInfo.save().then(err => {
                    if (!err) {
                        console.log("error fetching systemInfo", err);
                    }
                });
            }
    
        });
    }catch(SystemInfoFindOneErr){
        console.log("error fetching systemInfo")
    }
};


function getAddDateToDate(date, years, months, days) {
    var resDate = new Date(date);
    resDate.setFullYear(resDate.getFullYear() + years, resDate.getMonth() + months, resDate.getDay() + days);
    return resDate;
}


// create the model for users and expose it to our app
module.exports = mongoose.model('Result', resultSchema);
