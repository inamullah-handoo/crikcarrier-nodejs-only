const express = require('express');
const router = express.Router();

// models
let BatDetail = require('../models/batDetail');
let BowlDetail = require('../models/bowlDetail');
let FieldDetail = require('../models/fieldDetail');
let MatchDetail = require('../models/matchDetail');
let MID = require('../models/mID');


// overall route
router.get('/overall', (req,res) => {
    // connect to matchDetail collection
    MatchDetail.find({}, (err,matchDetails) => {
        if(err){
            console.log(err);
        }else{
            // match overs for combo box/select
            let matchOvers = [], output = '<option value="overall">Overall</option>';
            for(var i=0; i<matchDetails.length; i++){
                if(i == 0){
                    matchOvers.push(matchDetails[i].matchOvers);
                }else{
                    if(matchDetails[i].matchOvers != matchDetails[i-1].matchOvers){
                        matchOvers.push(matchDetails[i].matchOvers);
                    }
                }
            }
            for(i=0; i<matchOvers.length; i++){
                output += `<option value="${matchOvers[i]}">${matchOvers[i]}</option>`;
            }

            res.render('views/overall', {
                title: 'CrikCarrier | Overall Carrier',
                viewActive: 'bg-white text-success font-weight-bold',
                overs: output
            });
        }
    }).sort({'matchOvers':1});
});

// async call on /overall page
router.post('/overall/:overs', (req,res) => {
    // connect to matchDetails collection
    MatchDetail.find({}, (err,matchDetails) => {
        if(err){
            console.log(err);
        }else{
            // query as per overs
            let query = {}; // if overs == overall
            if(req.params.overs != 'overall'){
                let matchIDs = [];
                for(i=0; i<matchDetails.length; i++){
                    if(req.params.overs == matchDetails[i].matchOvers){
                        matchIDs.push(matchDetails[i].matchID);
                    }
                }
                query = {'matchID': matchIDs}; // if overs != overall
            }

            // connect to bowlDetails collection
            BowlDetail.find(query, (err,bowlDetails) => {
                if(err){
                    console.log(err);
                }else{
                    // bowling details
                    let bowlOvers = 0, bowlWickets = 0, bowlDots = 0, bowlMaidens = 0, bowlRuns = 0, bowlExtras = 0, bowl4 = 0, bowl6 = 0, bowl5WI = 0, bowlBest;
                    for(i=0; i<bowlDetails.length; i++){
                        bowlOvers += bowlDetails[i].overs;
                        bowlWickets += bowlDetails[i].wickets;
                        bowlDots += bowlDetails[i].dots;
                        bowlMaidens += bowlDetails[i].maidens;
                        bowlRuns += bowlDetails[i].runs;
                        bowlExtras += bowlDetails[i].extras;
                        bowl4 += bowlDetails[i].fours;
                        bowl6 += bowlDetails[i].sixes;
                        if(bowlDetails[i].wickets > 5){
                            bowl5WI++;
                        }
                        if(i == 0){
                            bowlBest = `${bowlDetails[i].wickets}-${bowlDetails[i].runs}`;
                        }else{
                            if(bowlDetails[i].wickets > bowlDetails[i-1].wickets){
                                bowlBest = `${bowlDetails[i].wickets}-${bowlDetails[i].runs}`;
                            }
                        }
                    }
                    let bowlAvg = bowlRuns / bowlDetails.length;
                    let bowlSR = (6 * bowlOvers) / bowlWickets;

                    // connect to fieldDetails collection
                    FieldDetail.find(query, (err,fieldDetails) => {
                        if(err){
                            console.log(err);
                        }else{
                            // fielding details
                            let catches = 0, RO = 0, stumps = 0;
                            for(i=0; i<fieldDetails.length; i++){
                                catches += fieldDetails[i].catches;
                                RO += fieldDetails[i].runOuts;
                                stumps += fieldDetails[i].stumps;
                            }

                            // connect to batDetails collection
                            BatDetail.find(query, (err, batDetails) => {
                                if(err){
                                    console.log(err);
                                }else{
                                    // batposition details for combo box/select
                                    let batPos = [], output = '<option value="overall">Overall</option>';
                                    for(i=0; i<batDetails.length; i++){
                                        if(i == 0){
                                            batPos.push(batDetails[i].batPos);
                                        }else{
                                            if(batDetails[i].batPos != batDetails[i-1].batPos){
                                                batPos.push(batDetails[i].batPos);
                                            }
                                        }
                                    }
                                    for(i=0; i<batPos.length; i++){
                                        output += `<option value="${batPos[i]}">${batPos[i]}</option>`;
                                    }

                                    // response
                                    let response = {
                                        matches: fieldDetails.length,
                                        batPos: output,
                                        bowlAvg: bowlAvg,
                                        bowlSR: bowlSR,
                                        bowlIngs: bowlDetails.length,
                                        bowlOvers: bowlOvers,
                                        bowlWickets: bowlWickets,
                                        bowlDots: bowlDots,
                                        bowlMaidens: bowlMaidens,
                                        bowlRuns: bowlRuns,
                                        bowlExtras: bowlExtras,
                                        bowl4: bowl4,
                                        bowl6: bowl6,
                                        bowl5WI: bowl5WI,
                                        bowlBest: bowlBest,
                                        catches: catches,
                                        RO: RO,
                                        stumps: stumps
                                    };
                                    res.send(response);
                                }
                            }).sort({'batPos':1});
                        }
                    });
                }
            });
        }
    });
});

// second async call on /overall page
router.post('/overall/batPos/:id', (req,res) => {
    // getting variables ready for overs and batPos
    let start = String(req.params.id).indexOf('overs') + 5, overs = String(req.params.id).substring(start), pos = String(req.params.id).substring(0, start-5);
    
    // connect to matchDetails collection
    MatchDetail.find({}, (err,matchDetails) => {
        if(err){
            console.log(err);
        }else{
            // query as per overs and batPos
            let query = {}; // if overs & pos == overall
            let matchIDs = [];
            if(overs != 'overall'){
                for(i=0; i<matchDetails.length; i++){
                    if(overs == matchDetails[i].matchOvers){
                        matchIDs.push(matchDetails[i].matchID);
                    }
                }
                query = {'matchID': matchIDs}; // if overs != overall

                if(pos != 'overall'){
                    query = {'matchID': matchIDs, 'batPos': pos}; // if batPos & overs != overall
                }
            }else if(pos != 'overall'){
                query = {'batPos': pos}; // if batPos != & overs == overall
            }

            // connect to batDetails collection
            BatDetail.find(query, (err, batDetails) => {
                if(err){
                    console.log(err);
                }else{
                    // batting details
                    let batRuns = 0, batBalls = 0, bat0 = 0, bat1 = 0, bat2 = 0, bat3 = 0, bat4 = 0, bat5 = 0, bat6 = 0, batNO = 0, bat50 = 0, bat100 = 0, batHighest = 0;
                    for(i=0; i<batDetails.length; i++){
                        batRuns += batDetails[i].runs;
                        batBalls += batDetails[i].balls;
                        bat0 += batDetails[i].dots;
                        bat1 += batDetails[i].ones;
                        bat2 += batDetails[i].twoes;
                        bat3 += batDetails[i].threes;
                        bat4 += batDetails[i].fours;
                        bat5 += batDetails[i].fives;
                        bat6 += batDetails[i].sixes;
                        if(batDetails[i].notOut == true){
                            batNO++;
                        }
                        if(batDetails[i].runs > 50 && batDetails[i].runs < 100){
                            bat50++;
                        }else if(batDetails[i].runs > 100){
                            bat100++;
                        }
                        if(i == 0){
                            if(batDetails[i].notOut == true){
                                batHighest = batDetails[i].runs + '*';
                            }else{
                                batHighest = batDetails[i].runs;
                            }
                        }else{
                            if(batDetails[i].runs > batDetails[i-1].runs){
                                if(batDetails[i].notOut == true){
                                    batHighest = batDetails[i].runs + '*';
                                }else{
                                    batHighest = batDetails[i].runs;
                                }
                            }
                        }
                    }
                    let batAvg = batRuns / (batDetails.length - batNO);
                    if(batDetails.length == batNO){
                        batAvg = batRuns;
                    }
                    let batSR = (batRuns / batBalls) * 100;

                    // response
                    let response = {
                        batIngs: batDetails.length,
                        bat50: bat50,
                        bat100: bat100,
                        batAvg: batAvg,
                        batSR: batSR,
                        batRuns: batRuns,
                        batBalls: batBalls,
                        bat0: bat0,
                        bat1: bat1,
                        bat2: bat2,
                        bat3: bat3,
                        bat4: bat4,
                        bat5: bat5,
                        bat6: bat6,
                        batNO: batNO,
                        batHighest: batHighest,
                    };
                    res.send(response);
                }
            });
        }
    });
});

// per tournament route
router.get('/perTrnmnt', (req,res) => {
    // connect to matchDetail collection
    MatchDetail.find({}, (err,matchDetails) => {
        if(err){
            console.log(err);
        }else{
            // tournament details for select/combo box
            let trnmnt = [], output = '';
            for(var i=0; i<matchDetails.length; i++){
                if(i == 0){
                    trnmnt.push(matchDetails[i].tournament);
                }else{
                    if(matchDetails[i].tournament != matchDetails[i-1].tournament){
                        trnmnt.push(matchDetails[i].tournament);
                    }
                }
            }
            for(i=0; i<trnmnt.length; i++){
                output += `<option value="${trnmnt[i]}">${trnmnt[i]}</option>`
            }

            res.render('views/perTrnmnt', {
                title: 'CrikCarrier | Per Tournament Carrier',
                viewActive: 'bg-white text-success font-weight-bold',
                trnmnt: output
            })
        }
    }).sort({'tournament':1});
});

// async call on /perTrnmnt page
router.post('/perTrnmnt/:trnmnt', (req,res) => {
    // connect to matchDetail collection
    MatchDetail.find({}, (err,matchDetails) => {
        if(err){
            console.log(err);
        }else{
            // matchIDs of selected tournament
            let matchIDs = [];
            for(var i=0; i<matchDetails.length; i++){
                if(matchDetails[i].tournament == req.params.trnmnt){
                    matchIDs.push(matchDetails[i].matchID);
                }
            }
            let query = {'matchID': matchIDs};

            // connect to matchDetail collection as per matchIDs
            MatchDetail.find(query, (err,matchDetails) => {
                if(err){
                    console.log(err);
                }else{
                    // match details as per matchIDs
                    let match = [];
                    for(i=0; i<matchDetails.length; i++){
                        match[i] = {
                            matchID: matchDetails[i].matchID,
                            date: matchDetails[i].date,
                            playedAgainst: matchDetails[i].playedAgainst,
                            playedAt: matchDetails[i].playedAt,
                            matchOvers: matchDetails[i].matchOvers
                        };
                    }

                    // connect to batDetail collection
                    BatDetail.find(query, (err,batDetails) => {
                        if(err){
                            console.log(err);
                        }else{
                            // bat details as per matchIDs
                            let bat = [];
                            for(i=0; i<batDetails.length; i++){
                                bat[i] = {
                                    batNO: batDetails[i].notOut,
                                    matchID: batDetails[i].matchID,
                                    batRuns: batDetails[i].runs,
                                    batBalls: batDetails[i].balls,
                                    bat4: batDetails[i].fours,
                                    bat6: batDetails[i].sixes,
                                    batSR: (batDetails[i].runs / batDetails[i].balls) * 100
                                };
                            }

                            // connect to bowlDetail collection
                            BowlDetail.find(query, (err,bowlDetails) => {
                                if(err){
                                    console.log(err);
                                }else{
                                    // bowl details as per matchIDs
                                    let bowl = [];
                                    for(i=0; i<bowlDetails.length; i++){
                                        bowl[i] = {
                                            matchID: bowlDetails[i].matchID,
                                            bowlOvers: bowlDetails[i].overs,
                                            bowlWickets: bowlDetails[i].wickets,
                                            bowlRuns: bowlDetails[i].runs,
                                            bowlMaidens: bowlDetails[i].maidens,
                                            bowlDots: bowlDetails[i].dots
                                        };
                                    }

                                    // connect to fieldDetail collection
                                    FieldDetail.find(query, (err,fieldDetails) => {
                                        if(err){
                                            console.log(err);
                                        }else{
                                            // field details as per matchIDs
                                            let field = [];
                                            for(i=0; i<fieldDetails.length; i++){
                                                field[i] = {
                                                    matchID: fieldDetails[i].matchID,
                                                    catches: fieldDetails[i].catches,
                                                    RO: fieldDetails[i].runOuts,
                                                    stumps: fieldDetails[i].stumps
                                                };
                                            }

                                            // response
                                            let response = {
                                                match,
                                                bat,
                                                bowl,
                                                field
                                            };
                                            res.send(response);
                                        }
                                    }).sort({'matchID':1});
                                }
                            }).sort({'matchID':1});
                        }
                    }).sort({'matchID':1});
                }
            }).sort({'date':1});
        }
    }).sort({'date':1});
});

// per month route
router.get('/perFormat', (req,res) => {
    // connect to matchDetail collection
    MatchDetail.find({}, (err,matchDetails) => {
        if(err){
            console.log(err);
        }else{
            // match overs for combo box/select
            let matchOvers = [], output = '<option value="overall">Overall</option>';
            for(var i=0; i<matchDetails.length; i++){
                if(i == 0){
                    matchOvers.push(matchDetails[i].matchOvers);
                }else{
                    if(matchDetails[i].matchOvers != matchDetails[i-1].matchOvers){
                        matchOvers.push(matchDetails[i].matchOvers);
                    }
                }
            }
            for(i=0; i<matchOvers.length; i++){
                output += `<option value="${matchOvers[i]}">${matchOvers[i]}</option>`;
            }

            res.render('views/perFormat',{
                title: 'CrikCarrier | Per Format Carrier',
                viewActive: 'bg-white text-success font-weight-bold',
                overs: output
            });
        }
    }).sort({'matchOvers':1});
});

// async call on /perFormat page
router.post('/perFormat/:overs', (req,res) => {
    // connect to matchDetail collection
    MatchDetail.find({}, (err,matchDetails) => {
        if(err){
            console.log(err);
        }else{
            // query as per overs
            let query = {}; // if overs == overall
            if(req.params.overs != 'overall'){
                let matchIDs = [];
                for(i=0; i<matchDetails.length; i++){
                    if(req.params.overs == matchDetails[i].matchOvers){
                        matchIDs.push(matchDetails[i].matchID);
                    }
                }
                query = {'matchID': matchIDs}; // if overs != overall
            }
            
            // connect to matchDetail collection as per matchIDs
            MatchDetail.find(query, (err,matchDetails) => {
                if(err){
                    console.log(err);
                }else{
                    // match details as per matchIDs
                    let match = [];
                    for(i=0; i<matchDetails.length; i++){
                        match[i] = {
                            matchID: matchDetails[i].matchID,
                            date: matchDetails[i].date,
                            playedAgainst: matchDetails[i].playedAgainst,
                            playedAt: matchDetails[i].playedAt,
                            matchOvers: matchDetails[i].matchOvers,
                            tournament: matchDetails[i].tournament
                        };
                    }

                    // connect to batDetail collection
                    BatDetail.find(query, (err,batDetails) => {
                        if(err){
                            console.log(err);
                        }else{
                            // bat details as per matchIDs
                            let bat = [];
                            for(i=0; i<batDetails.length; i++){
                                bat[i] = {
                                    batNO: batDetails[i].notOut,
                                    matchID: batDetails[i].matchID,
                                    batRuns: batDetails[i].runs,
                                    batBalls: batDetails[i].balls,
                                    bat4: batDetails[i].fours,
                                    bat6: batDetails[i].sixes,
                                    batSR: (batDetails[i].runs / batDetails[i].balls) * 100
                                };
                            }

                            // connect to bowlDetail collection
                            BowlDetail.find(query, (err,bowlDetails) => {
                                if(err){
                                    console.log(err);
                                }else{
                                    // bowl details as per matchIDs
                                    let bowl = [];
                                    for(i=0; i<bowlDetails.length; i++){
                                        bowl[i] = {
                                            matchID: bowlDetails[i].matchID,
                                            bowlOvers: bowlDetails[i].overs,
                                            bowlWickets: bowlDetails[i].wickets,
                                            bowlRuns: bowlDetails[i].runs,
                                            bowlMaidens: bowlDetails[i].maidens,
                                            bowlDots: bowlDetails[i].dots
                                        };
                                    }

                                    // connect to fieldDetail collection
                                    FieldDetail.find(query, (err,fieldDetails) => {
                                        if(err){
                                            console.log(err);
                                        }else{
                                            // field details as per matchIDs
                                            let field = [];
                                            for(i=0; i<fieldDetails.length; i++){
                                                field[i] = {
                                                    matchID: fieldDetails[i].matchID,
                                                    catches: fieldDetails[i].catches,
                                                    RO: fieldDetails[i].runOuts,
                                                    stumps: fieldDetails[i].stumps
                                                };
                                            }

                                            // response
                                            let response = {
                                                match,
                                                bat,
                                                bowl,
                                                field
                                            };
                                            res.send(response);
                                        }
                                    }).sort({'matchID':1});
                                }
                            }).sort({'matchID':1});
                        }
                    }).sort({'matchID':1});
                }
            }).sort({'date':1});
        }
    }).sort({'date':1});
});


module.exports = router;