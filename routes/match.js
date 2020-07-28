const express = require('express');
const router = express.Router();

// models
let BatDetail = require('../models/batDetail');
let BowlDetail = require('../models/bowlDetail');
let FieldDetail = require('../models/fieldDetail');
let MatchDetail = require('../models/matchDetail');
let MID = require('../models/mID');

// global functions



// add match route
router.get('/addMatch', (req,res) => {
    // getting current date
    let now = new Date();
    let day = now.getDate();
    let month = now.getMonth();
    let year = now.getFullYear();
    if(month < 10){
        month = '0' + month;
    }
    if(day < 10){
        day = '0' + day;
    }
    let date = year + '-' + month + '-' + day;

    res.render('match/addMatch',{
        title:'CrikCarrier | Add Match Details',
        addMatchActive: 'bg-white text-success font-weight-bold',
        date,
        // options of playing style/details for select/combo box
        options:`
            <option value="Batting Only">Batting Only</option>
            <option value="Bowling Only">Bowling Only</option>
            <option value="Both">Both Batting and Fielding</option>
            <option value="Fielding Only">Fielding Only</option>
        `
    });
});

// save match to db
router.post('/addMatch', (req,res) => {
    // get playing style/detail
    let play = req.body.playDetail;

    // validation
    req.checkBody('date','is needed').notEmpty();
    req.checkBody('matchOvers','is needed').notEmpty();
    req.checkBody('playedAgainst','is needed').notEmpty();
    req.checkBody('playedAt','is needed').notEmpty();
    req.checkBody('tournament','is needed').notEmpty();
    req.checkBody('fieldCatches','is needed').notEmpty();
    req.checkBody('fieldRO','is needed').notEmpty();
    req.checkBody('fieldStumps','is needed').notEmpty();
    function batCheck(){
        req.checkBody('batRuns','is needed').notEmpty();
        req.checkBody('batBalls','is needed').notEmpty();
        req.checkBody('batDots','is needed').notEmpty();
        req.checkBody('batOnes','is needed').notEmpty();
        req.checkBody('batTwoes','is needed').notEmpty();
        req.checkBody('batThrees','is needed').notEmpty();
        req.checkBody('batFours','is needed').notEmpty();
        req.checkBody('batFives','is needed').notEmpty();
        req.checkBody('batSixes','is needed').notEmpty();
        req.checkBody('batNO','true/false').isBoolean();
        req.checkBody('batBatPos','is needed').notEmpty();
    }
    function bowlCheck(){
        req.checkBody('bowlOvers','is needed').notEmpty();
        req.checkBody('bowlWickets','is needed').notEmpty();
        req.checkBody('bowlRuns','is needed').notEmpty();
        req.checkBody('bowlDots','is needed').notEmpty();
        req.checkBody('bowlMaidens','is needed').notEmpty();
        req.checkBody('bowlExtras','is needed').notEmpty();
        req.checkBody('bowlFours','is needed').notEmpty();
        req.checkBody('bowlSixes','is needed').notEmpty();
    }
    if(play == 'Batting Only'){
        batCheck();
    }else if(play == 'Bowling Only'){
        bowlCheck();
    }else if(play == 'Both'){
        batCheck();
        bowlCheck();
    }

    // if errors are found in validation
    let errors = req.validationErrors();

    // validation of cricket fundamentals/custom errors
    // fundamental batting errors
    let runs = Number(req.body.batOnes) + (2 * Number(req.body.batTwoes)) + (3 * Number(req.body.batThrees)) + (4 * Number(req.body.batFours)) + (5 * Number(req.body.batFives)) + (6 * Number(req.body.batSixes));
    if(req.body.batRuns != runs){
        if(!errors){
            errors = [];
        }
        errors.push({param: 'batRuns', msg: 'Error in calculated runs', value: ''});
    }
    let balls = Number(req.body.batDots) + Number(req.body.batOnes) + Number(req.body.batTwoes) + Number(req.body.batThrees) + Number(req.body.batFours) + Number(req.body.batFives) + Number(req.body.batSixes);
    if(req.body.batBalls != balls){
        if(!errors){
            errors = [];
        }
        errors.push({param: 'batBalls', msg: 'Error in calculated balls', value: ''});
    }
    // fundamental bowling/fielding errors
    if(Number(req.body.bowlMaidens) > Number(req.body.bowlOvers) || (Number(req.body.bowlDots) / 6) > Number(req.body.bowlOvers)){
        if(!errors){
            errors = [];
        }
        errors.push({param: 'bowlOvers', msg: 'Error in calculated overs', value: ''});
    }
    if(Number(req.body.bowlMaidens) > Number(req.body.bowlDots) / 6){
        if(!errors){
            errors = [];
        }
        errors.push({param: 'bowlMaidens', msg: 'Error in calculated maidens', value: ''});
    }
    if(Number(req.body.bowlWickets) > 10 || (Number(req.body.fieldRO) + Number(req.body.fieldStumps) + Number(req.body.bowlWickets)) > 10){
        if(!errors){
            errors = [];
        }
        errors.push({param: 'bowlWickets', msg: 'Error in calculated wickets', value: ''});
    }
    if(Number(req.body.bowlRuns) < ((Number(req.body.bowlFours) * 4) + (Number(req.body.bowlSixes) * 6) + Number(req.body.bowlExtras)) || (Number(req.body.bowlOvers) * 6) - Number(req.body.bowlDots) > Number(req.body.bowlRuns)){
        if(!errors){
            errors = [];
        }
        errors.push({param: 'bowlRuns', msg: 'Error in calculated runs', value: ''});
    }
    if((Number(req.body.fieldRO) + Number(req.body.fieldStumps) + Number(req.body.fieldCatches)) > 10){
        if(!errors){
            errors = [];
        }
        errors.push({param: 'fieldRO', msg: 'Error in calculated wickets', value: ''});
        errors.push({param: 'fieldStumps', msg: 'Error in calculated wickets', value: ''});
        errors.push({param: 'fieldCatches', msg: 'Error in calculated wickets', value: ''});
    }

    // output if errors are found
    if(errors){
        // options of playing style/details depending upon selected option for select/combo box
        let options = '';
        if(play == 'Batting Only'){
            options = `
                <option value="Batting Only">Batting Only</option>
                <option value="Both">Both Batting and Fielding</option>
                <option value="Bowling Only">Bowling Only</option>
                <option value="Fielding Only">Fielding Only</option>
            `;
        }else if(play == 'Bowling Only'){
            options = `
                <option value="Bowling Only">Bowling Only</option>
                <option value="Both">Both Batting and Fielding</option>
                <option value="Batting Only">Batting Only</option>
                <option value="Fielding Only">Fielding Only</option>
            `;
        }else if(play == 'Both'){
            options = `
                <option value="Both">Both Batting and Fielding</option>
                <option value="Batting Only">Batting Only</option>
                <option value="Bowling Only">Bowling Only</option>
                <option value="Fielding Only">Fielding Only</option>
            `;
        }else{
            options = `
                <option value="Fielding Only">Fielding Only</option>
                <option value="Batting Only">Batting Only</option>
                <option value="Bowling Only">Bowling Only</option>
                <option value="Both">Both Batting and Fielding</option>
            `;
        }

        res.render('match/addMatch', {
            title: 'CrikCarrier | Add Match Details',
            addMatchActive: 'bg-white text-success font-weight-bold',
            date: req.body.date,
            tournament: req.body.tournament,
            errors,
            options,
            matchOvers: req.body.matchOvers,
            playedAgainst: req.body.playedAgainst,
            playedAt: req.body.playedAt,
            batBalls: req.body.batBalls,
            batBatPos: req.body.batBatPos,
            batDots: req.body.batDots,
            batRuns: req.body.batRuns,
            batNO: req.body.batNO,
            batOnes: req.body.batOnes,
            batTwoes: req.body.batTwoes,
            batThrees: req.body.batThrees,
            batFours: req.body.batFours,
            batFives: req.body.batFives,
            batSixes: req.body.batSixes,
            bowlOvers: req.body.bowlOvers,
            bowlWickets: req.body.bowlWickets,
            bowlRuns: req.body.bowlRuns,
            bowlMaidens: req.body.bowlMaidens,
            bowlDots: req.body.bowlDots,
            bowlFours: req.body.bowlFours,
            bowlSixes: req.body.bowlSixes,
            bowlExtras: req.body.bowlExtras,
            fieldCatches: req.body.fieldCatches,
            fieldRO: req.body.fieldRO,
            fieldStumps: req.body.fieldStumps
        });
    }else{
        // if no error in validation
        // connect to MID collection
        MID.find({}, (err,mIDs) => {
            if(err){
                console.log(err);
            }else{
                // get matchID
                let matchID = mIDs[0].matchID;

                // update matchID
                let mID = {};
                mID.matchID = matchID + 1;
                MID.updateOne({'matchID':matchID}, mID, err => {
                    if(err){
                        console.log(err);
                    }
                });

                // increment matchID
                matchID++;

                // save matchDetail to db
                let matchDetail = new MatchDetail();
                matchDetail.date = req.body.date;
                matchDetail.playedAgainst = req.body.playedAgainst;
                matchDetail.playedAt = req.body.playedAt;
                matchDetail.tournament = req.body.tournament;
                matchDetail.matchOvers = req.body.matchOvers;
                matchDetail.matchID = matchID;
                matchDetail.save(err => {
                    if(err){
                        console.log(err);
                    }else{
                        // save fieldDetail to db
                        let fieldDetail = new FieldDetail();
                        fieldDetail.catches = req.body.fieldCatches;
                        fieldDetail.runOuts = req.body.fieldRO;
                        fieldDetail.stumps = req.body.fieldStumps;
                        fieldDetail.matchID = matchID;
                        fieldDetail.save(err => {
                            if(err){
                                console.log(err);
                            }else{
                                // save bat/bowl details to db depending upon playing style/detail
                                if(play == 'Batting Only'){
                                    let batDetail = new BatDetail();
                                    batDetail.runs = req.body.batRuns;
                                    batDetail.balls = req.body.batBalls;
                                    batDetail.dots = req.body.batDots;
                                    batDetail.ones = req.body.batOnes;
                                    batDetail.twoes = req.body.batTwoes;
                                    batDetail.threes = req.body.batThrees;
                                    batDetail.fours = req.body.batFours;
                                    batDetail.fives = req.body.batFives;
                                    batDetail.sixes = req.body.batSixes;
                                    batDetail.notOut = req.body.batNO;
                                    batDetail.batPos = req.body.batBatPos;
                                    batDetail.matchID = matchID;
                                    batDetail.save(err => {
                                        if(err){
                                            console.log(err);
                                        }else{
                                            res.redirect('/');
                                        }
                                    });
                                }else if(play == 'Bowling Only'){
                                    let bowlDetail = new BowlDetail();
                                    bowlDetail.overs = req.body.bowlOvers;
                                    bowlDetail.wickets = req.body.bowlWickets;
                                    bowlDetail.dots = req.body.bowlDots;
                                    bowlDetail.maidens = req.body.bowlMaidens;
                                    bowlDetail.runs = req.body.bowlRuns;
                                    bowlDetail.extras = req.body.bowlExtras;
                                    bowlDetail.fours = req.body.bowlFours;
                                    bowlDetail.sixes = req.body.bowlSixes;
                                    bowlDetail.matchID = matchID;
                                    bowlDetail.save(err => {
                                        if(err){
                                            console.log(err);
                                        }else{
                                            res.redirect('/');
                                        }
                                    });
                                }else if(play == 'Both'){
                                    let batDetail = new BatDetail();
                                    batDetail.runs = req.body.batRuns;
                                    batDetail.balls = req.body.batBalls;
                                    batDetail.dots = req.body.batDots;
                                    batDetail.ones = req.body.batOnes;
                                    batDetail.twoes = req.body.batTwoes;
                                    batDetail.threes = req.body.batThrees;
                                    batDetail.fours = req.body.batFours;
                                    batDetail.fives = req.body.batFives;
                                    batDetail.sixes = req.body.batSixes;
                                    batDetail.notOut = req.body.batNO;
                                    batDetail.batPos = req.body.batBatPos;
                                    batDetail.matchID = matchID;
                                    batDetail.save(err => {
                                        if(err){
                                            console.log(err);
                                        }else{
                                            let bowlDetail = new BowlDetail();
                                            bowlDetail.overs = req.body.bowlOvers;
                                            bowlDetail.wickets = req.body.bowlWickets;
                                            bowlDetail.dots = req.body.bowlDots;
                                            bowlDetail.maidens = req.body.bowlMaidens;
                                            bowlDetail.runs = req.body.bowlRuns;
                                            bowlDetail.extras = req.body.bowlExtras;
                                            bowlDetail.fours = req.body.bowlFours;
                                            bowlDetail.sixes = req.body.bowlSixes;
                                            bowlDetail.matchID = matchID;
                                            bowlDetail.save(err => {
                                                if(err){
                                                    console.log(err);
                                                }else{
                                                    res.redirect('/');
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            }
        });
    }
});

// view match route
router.get('/viewMatch/:id', (req,res) => {
    let query = {'matchID': req.params.id};

    // connect to matchDetail collection
    MatchDetail.find(query, (err,matchDetails) => {
        if(err){
            console.log(err);
        }else{
            // connect to batDetail collection
            BatDetail.find(query, (err,batDetails) => {
                if(err){
                    console.log(err);
                }else{
                    // connect to bowlDetail collection
                    BowlDetail.find(query, (err,bowlDetails) => {
                        if(err){
                            console.log(err);
                        }else{
                            // connect to fieldDetail collection
                            FieldDetail.find(query, (err,fieldDetails) => {
                                if(err){
                                    console.log(err);
                                }else{
                                    let bowl, bat;
                                    if(bowlDetails[0]){
                                        bowl = {
                                            bowlSR: (6 * bowlDetails[0].overs) / bowlDetails[0].wickets,
                                            bowlOvers: bowlDetails[0].overs,
                                            bowlWickets: bowlDetails[0].wickets,
                                            bowlDots: bowlDetails[0].dots,
                                            bowlMaidens: bowlDetails[0].maidens,
                                            bowlRuns: bowlDetails[0].runs,
                                            bowlExtras: bowlDetails[0].extras,
                                            bowl4: bowlDetails[0].fours,
                                            bowl6: bowlDetails[0].sixes
                                        };
                                    }
                                    if(batDetails[0]){
                                        bat = {
                                            batSR: (batDetails[0].runs / batDetails[0].balls) * 100,
                                            batRuns: batDetails[0].runs,
                                            batBalls: batDetails[0].balls,
                                            bat0: batDetails[0].dots,
                                            bat1: batDetails[0].ones,
                                            bat2: batDetails[0].twoes,
                                            bat3: batDetails[0].threes,
                                            bat4: batDetails[0].fours,
                                            bat5: batDetails[0].fives,
                                            bat6: batDetails[0].sixes,
                                            batNO: batDetails[0].notOut,
                                            batPos: batDetails[0].batPos
                                        };
                                    }
                                    res.render('match/match',{
                                        title: 'CrikCarrier | Match Details',
                                        matchID: req.params.id,
                                        bat,
                                        bowl,
                                        catches: fieldDetails[0].catches,
                                        RO: fieldDetails[0].runOuts,
                                        stumps: fieldDetails[0].stumps,
                                        date: matchDetails[0].date,
                                        playedAgainst: matchDetails[0].playedAgainst,
                                        playedAt: matchDetails[0].playedAt,
                                        tournament: matchDetails[0].tournament,
                                        matchOvers: matchDetails[0].matchOvers
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

// edit match route
router.get('/editMatch/:id', (req,res) => {
    let query = {'matchID': req.params.id};

    // connect to matchDetail collection
    MatchDetail.find(query, (err,matchDetails) => {
        if(err){
            console.log(err);
        }else{
            // connect to batDetail collection
            BatDetail.find(query, (err,batDetails) => {
                if(err){
                    console.log(err);
                }else{
                    // connect to bowlDetail collection
                    BowlDetail.find(query, (err,bowlDetails) => {
                        if(err){
                            console.log(err);
                        }else{
                            // connect to fieldDetail collection
                            FieldDetail.find(query, (err,fieldDetails) => {
                                if(err){
                                    console.log(err);
                                }else{
                                    let bowl, bat, options;
                                    function fbat(){
                                        bat = {
                                            batSR: (batDetails[0].runs / batDetails[0].balls) * 100,
                                            batRuns: batDetails[0].runs,
                                            batBalls: batDetails[0].balls,
                                            bat0: batDetails[0].dots,
                                            bat1: batDetails[0].ones,
                                            bat2: batDetails[0].twoes,
                                            bat3: batDetails[0].threes,
                                            bat4: batDetails[0].fours,
                                            bat5: batDetails[0].fives,
                                            bat6: batDetails[0].sixes,
                                            batNO: batDetails[0].notOut,
                                            batPos: batDetails[0].batPos
                                        };
                                    }
                                    function fbowl(){
                                        bowl = {
                                            bowlSR: (6 * bowlDetails[0].overs) / bowlDetails[0].wickets,
                                            bowlOvers: bowlDetails[0].overs,
                                            bowlWickets: bowlDetails[0].wickets,
                                            bowlDots: bowlDetails[0].dots,
                                            bowlMaidens: bowlDetails[0].maidens,
                                            bowlRuns: bowlDetails[0].runs,
                                            bowlExtras: bowlDetails[0].extras,
                                            bowl4: bowlDetails[0].fours,
                                            bowl6: bowlDetails[0].sixes
                                        };
                                    }

                                    // playing style(for combo box/select),bat,bowl,field and match details
                                    if(batDetails[0] && bowlDetails[0]){
                                        options = `
                                            <option value="Both">Both Batting and Fielding</option>
                                            <option value="Batting Only">Batting Only</option>
                                            <option value="Bowling Only">Bowling Only</option>
                                            <option value="Fielding Only">Fielding Only</option>
                                        `;
                                        fbat();
                                        fbowl();
                                    }else if(batDetails[0] && !bowlDetails[0]){
                                        options = `
                                            <option value="Batting Only">Batting Only</option>
                                            <option value="Both">Both Batting and Fielding</option>
                                            <option value="Bowling Only">Bowling Only</option>
                                            <option value="Fielding Only">Fielding Only</option>
                                        `;
                                        fbat();
                                    }else if(!batDetails[0] && bowlDetails[0]){
                                        options = `
                                            <option value="Bowling Only">Bowling Only</option>
                                            <option value="Both">Both Batting and Fielding</option>
                                            <option value="Batting Only">Batting Only</option>
                                            <option value="Fielding Only">Fielding Only</option>
                                        `;
                                        fbowl();
                                    }else{
                                        options=`
                                            <option value="Fielding Only">Fielding Only</option>
                                            <option value="Batting Only">Batting Only</option>
                                            <option value="Both">Both Batting and Fielding</option>
                                            <option value="Bowling Only">Bowling Only</option>
                                        `
                                    }

                                    res.render('match/editMatch',{
                                        title: 'CrikCarrier | Edit Match Details',
                                        options,
                                        matchID: req.params.id,
                                        bat,
                                        bowl,
                                        catches: fieldDetails[0].catches,
                                        RO: fieldDetails[0].runOuts,
                                        stumps: fieldDetails[0].stumps,
                                        date: matchDetails[0].date,
                                        playedAgainst: matchDetails[0].playedAgainst,
                                        playedAt: matchDetails[0].playedAt,
                                        tournament: matchDetails[0].tournament,
                                        matchOvers: matchDetails[0].matchOvers
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

// update match to db
router.post('/editMatch/:id', (req,res) => {
    let query = {'matchID': req.params.id};
    // get playing style/detail
    let play = req.body.playDetail;

    // validation
    req.checkBody('date','is needed').notEmpty();
    req.checkBody('matchOvers','is needed').notEmpty();
    req.checkBody('playedAgainst','is needed').notEmpty();
    req.checkBody('playedAt','is needed').notEmpty();
    req.checkBody('tournament','is needed').notEmpty();
    req.checkBody('fieldCatches','is needed').notEmpty();
    req.checkBody('fieldRO','is needed').notEmpty();
    req.checkBody('fieldStumps','is needed').notEmpty();
    function batCheck(){
        req.checkBody('batRuns','is needed').notEmpty();
        req.checkBody('batBalls','is needed').notEmpty();
        req.checkBody('batDots','is needed').notEmpty();
        req.checkBody('batOnes','is needed').notEmpty();
        req.checkBody('batTwoes','is needed').notEmpty();
        req.checkBody('batThrees','is needed').notEmpty();
        req.checkBody('batFours','is needed').notEmpty();
        req.checkBody('batFives','is needed').notEmpty();
        req.checkBody('batSixes','is needed').notEmpty();
        req.checkBody('batNO','true/false').isBoolean();
        req.checkBody('batBatPos','is needed').notEmpty();
    }
    function bowlCheck(){
        req.checkBody('bowlOvers','is needed').notEmpty();
        req.checkBody('bowlWickets','is needed').notEmpty();
        req.checkBody('bowlRuns','is needed').notEmpty();
        req.checkBody('bowlDots','is needed').notEmpty();
        req.checkBody('bowlMaidens','is needed').notEmpty();
        req.checkBody('bowlExtras','is needed').notEmpty();
        req.checkBody('bowlFours','is needed').notEmpty();
        req.checkBody('bowlSixes','is needed').notEmpty();
    }
    if(play == 'Batting Only'){
        batCheck();
    }else if(play == 'Bowling Only'){
        bowlCheck();
    }else if(play == 'Both'){
        batCheck();
        bowlCheck();
    }

    // if errors are found in validation
    let errors = req.validationErrors();

    // validation of cricket fundamentals/custom errors
    // fundamental batting errors
    let runs = Number(req.body.batOnes) + (2 * Number(req.body.batTwoes)) + (3 * Number(req.body.batThrees)) + (4 * Number(req.body.batFours)) + (5 * Number(req.body.batFives)) + (6 * Number(req.body.batSixes));
    if(req.body.batRuns != runs){
        if(!errors){
            errors = [];
        }
        errors.push({param: 'batRuns', msg: 'Error in calculated runs', value: ''});
    }
    let balls = Number(req.body.batDots) + Number(req.body.batOnes) + Number(req.body.batTwoes) + Number(req.body.batThrees) + Number(req.body.batFours) + Number(req.body.batFives) + Number(req.body.batSixes);
    if(req.body.batBalls != balls){
        if(!errors){
            errors = [];
        }
        errors.push({param: 'batBalls', msg: 'Error in calculated balls', value: ''});
    }
    // fundamental bowling/fielding errors
    if(Number(req.body.bowlMaidens) > Number(req.body.bowlOvers) || (Number(req.body.bowlDots) / 6) > Number(req.body.bowlOvers)){
        if(!errors){
            errors = [];
        }
        errors.push({param: 'bowlOvers', msg: 'Error in calculated overs', value: ''});
    }
    if(Number(req.body.bowlMaidens) > Number(req.body.bowlDots) / 6){
        if(!errors){
            errors = [];
        }
        errors.push({param: 'bowlMaidens', msg: 'Error in calculated maidens', value: ''});
    }
    if(Number(req.body.bowlWickets) > 10 || (Number(req.body.fieldRO) + Number(req.body.fieldStumps) + Number(req.body.bowlWickets)) > 10){
        if(!errors){
            errors = [];
        }
        errors.push({param: 'bowlWickets', msg: 'Error in calculated wickets', value: ''});
    }
    if(Number(req.body.bowlRuns) < ((Number(req.body.bowlFours) * 4) + (Number(req.body.bowlSixes) * 6) + Number(req.body.bowlExtras)) || (Number(req.body.bowlOvers) * 6) - Number(req.body.bowlDots) > Number(req.body.bowlRuns)){
        if(!errors){
            errors = [];
        }
        errors.push({param: 'bowlRuns', msg: 'Error in calculated runs', value: ''});
    }
    if((Number(req.body.fieldRO) + Number(req.body.fieldStumps) + Number(req.body.fieldCatches)) > 10){
        if(!errors){
            errors = [];
        }
        errors.push({param: 'fieldRO', msg: 'Error in calculated wickets', value: ''});
        errors.push({param: 'fieldStumps', msg: 'Error in calculated wickets', value: ''});
        errors.push({param: 'fieldCatches', msg: 'Error in calculated wickets', value: ''});
    }

    // output if errors are found
    if(errors){
        // options of playing style/details depending upon selected option for select/combo box
        let options = '';
        if(play == 'Batting Only'){
            options = `
                <option value="Batting Only">Batting Only</option>
                <option value="Both">Both Batting and Fielding</option>
                <option value="Bowling Only">Bowling Only</option>
                <option value="Fielding Only">Fielding Only</option>
            `;
        }else if(play == 'Bowling Only'){
            options = `
                <option value="Bowling Only">Bowling Only</option>
                <option value="Both">Both Batting and Fielding</option>
                <option value="Batting Only">Batting Only</option>
                <option value="Fielding Only">Fielding Only</option>
            `;
        }else if(play == 'Both'){
            options = `
                <option value="Both">Both Batting and Fielding</option>
                <option value="Batting Only">Batting Only</option>
                <option value="Bowling Only">Bowling Only</option>
                <option value="Fielding Only">Fielding Only</option>
            `;
        }else{
            options = `
                <option value="Fielding Only">Fielding Only</option>
                <option value="Batting Only">Batting Only</option>
                <option value="Bowling Only">Bowling Only</option>
                <option value="Both">Both Batting and Fielding</option>
            `;
        }

        res.render('match/editMatch', {
            title: 'CrikCarrier | Edit Match Details',
            date: req.body.date,
            tournament: req.body.tournament,
            errors,
            options,
            matchID: req.params.id,
            matchOvers: req.body.matchOvers,
            playedAgainst: req.body.playedAgainst,
            playedAt: req.body.playedAt,
            batBalls: req.body.batBalls,
            batBatPos: req.body.batBatPos,
            batDots: req.body.batDots,
            batRuns: req.body.batRuns,
            batNO: req.body.batNO,
            batOnes: req.body.batOnes,
            batTwoes: req.body.batTwoes,
            batThrees: req.body.batThrees,
            batFours: req.body.batFours,
            batFives: req.body.batFives,
            batSixes: req.body.batSixes,
            bowlOvers: req.body.bowlOvers,
            bowlWickets: req.body.bowlWickets,
            bowlRuns: req.body.bowlRuns,
            bowlMaidens: req.body.bowlMaidens,
            bowlDots: req.body.bowlDots,
            bowlFours: req.body.bowlFours,
            bowlSixes: req.body.bowlSixes,
            bowlExtras: req.body.bowlExtras,
            fieldCatches: req.body.fieldCatches,
            fieldRO: req.body.fieldRO,
            fieldStumps: req.body.fieldStumps
        });
    }else{
        let batu = {}, bowlu = {}, field = {}, match = {};
        batu.runs = req.body.batRuns;
        batu.balls = req.body.batBalls;
        batu.batPos = req.body.batBatPos;
        batu.dots = req.body.batDots;
        batu.notOut = req.body.batNO;
        batu.ones = req.body.batOnes;
        batu.twoes = req.body.batTwoes;
        batu.threes = req.body.batThrees;
        batu.fours = req.body.batFours;
        batu.fives = req.body.batFives;
        batu.sixes = req.body.batSixes;
        bowlu.overs = req.body.bowlOvers;
        bowlu.wickets = req.body.bowlWickets;
        bowlu.runs = req.body.bowlRuns;
        bowlu.maidens = req.body.bowlMaidens;
        bowlu.dots = req.body.bowlDots;
        bowlu.fours = req.body.bowlFours;
        bowlu.sixes = req.body.bowlSixes;
        bowlu.extras = req.body.bowlExtras;
        field.catches = req.body.fieldCatches;
        field.stumps = req.body.fieldStumps;
        field.runOuts = req.body.fieldRO;
        match.date = req.body.date;
        match.tournament = req.body.tournament;
        match.playedAgainst = req.body.playedAgainst;
        match.playedAt = req.body.playedAt;
        match.matchOvers = req.body.matchOvers;

        let bats = new BatDetail();
        let bowls = new BowlDetail();
        bats.runs = req.body.batRuns;
        bats.balls = req.body.batBalls;
        bats.batPos = req.body.batBatPos;
        bats.dots = req.body.batDots;
        bats.notOut = req.body.batNO;
        bats.ones = req.body.batOnes;
        bats.twoes = req.body.batTwoes;
        bats.threes = req.body.batThrees;
        bats.fours = req.body.batFours;
        bats.fives = req.body.batFives;
        bats.sixes = req.body.batSixes;
        bats.matchID = req.params.id;
        bowls.overs = req.body.bowlOvers;
        bowls.wickets = req.body.bowlWickets;
        bowls.runs = req.body.bowlRuns;
        bowls.maidens = req.body.bowlMaidens;
        bowls.dots = req.body.bowlDots;
        bowls.fours = req.body.bowlFours;
        bowls.sixes = req.body.bowlSixes;
        bowls.extras = req.body.bowlExtras;
        bowls.matchID = req.params.id;

        function updateBat(query, bat){
            BatDetail.updateOne(query, bat, err => {
                if(err){
                    console.log(err);
                }
            });
        }
        function saveBat(bat){
            bat.save(err => {
                if(err){
                    console.log(err);
                }
            });
        }
        function deleteBat(query){
            BatDetail.deleteOne(query, err => {
                if(err){
                    console.log(err);
                }
            });
        }
        function updateBowl(query, bowl){
            BowlDetail.updateOne(query, bowl, err => {
                if(err){
                    console.log(err);
                }
            });
        }
        function saveBowl(bowl){
            bowl.save(err => {
                if(err){
                    console.log(err);
                }
            });
        }
        function deleteBowl(query){
            BowlDetail.deleteOne(query, err => {
                if(err){
                    console.log(err);
                }
            });
        }
        BatDetail.find(query, (err, batDetails) => {
            if(err){
                console.log(err);
            }else{
                BowlDetail.find(query, (err, bowlDetails) => {
                    if(err){
                        console.log(err);
                    }else{
                        if(batDetails.length > 0){
                            if(bowlDetails.length > 0 && play == 'Batting Only'){
                                // normal update bat
                                // delete bowl details
                                updateBat(query, batu);
                                deleteBowl(query);
                            }else if(bowlDetails.length > 0 && play == 'Both'){
                                // normal update of bat and bowl details
                                updateBat(query, batu);
                                updateBowl(query, bowlu);
                            }else if(bowlDetails.length > 0 && play == 'Bowling Only'){
                                // delete bat details
                                // normal update bowl details
                                deleteBat(query);
                                updateBowl(query, bowlu);
                            }else if(!bowlDetails.length > 0 && play == 'Both'){
                                // normal update of bat details only
                                // add bowl details
                                updateBat(query, batu);
                                saveBowl(bowls);
                            }else if(!bowlDetails.length > 0 && play == 'Batting Only'){
                                // normal update bat details
                                updateBat(query, batu);
                            }else if(!bowlDetails.length > 0 && play == 'Bowling Only'){
                                // delete bat details
                                // add bowl details
                                deleteBat(query);
                                saveBowl(bowls);
                            }
                        }else if(!batDetails.length > 0){
                            if(bowlDetails.length > 0 && play == 'Batting Only'){
                                // add bat details
                                // delete bowl details
                                saveBat(bats);
                                deleteBowl(query);
                            }else if(bowlDetails.length > 0 && play == 'Both'){
                                // normal update bowl details
                                // add bat details
                                updateBowl(query, bowlu);
                                saveBat(bats);
                            }else if(bowlDetails.length > 0 && play == 'Bowling Only'){
                                // normal update bowl details
                                updateBowl(query, bowlu);
                            }else if(!bowlDetails.length > 0){
                                if(play == 'Batting Only'){
                                    // add bat details
                                    saveBat(bats);
                                }else if(play == 'Bowling Only'){
                                    // add bowl details
                                    saveBowl(bowls);
                                }else if(play == 'Both'){
                                    // add bat and bowl details
                                    saveBat(bats);
                                    saveBowl(bowls);
                                }
                            }
                        }
                        if(play == 'Fielding Only'){
                            if(batDetails.length > 0){
                                deleteBat(query);
                            }
                            if(bowlDetails.length > 0){
                                deleteBowl(query);
                            }
                        }
                        FieldDetail.updateOne(query, field, err => {
                            if(err){
                                console.log(err);
                            }else{
                                MatchDetail.updateOne(query, match, err => {
                                    if(err){
                                        console.log(err);
                                    }else{
                                        res.redirect('/');
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
});

// delete match
router.delete('/deleteMatch/:id', (req, res) => {
    let query = {'matchID': req.params.id};
    BowlDetail.deleteOne(query, err => {
        if(err){
            console.log(err);
        }else{
            BatDetail.deleteOne(query, err => {
                if(err){
                    console.log(err);
                }else{
                    FieldDetail.deleteOne(query, err => {
                        if(err){
                            console.log(err);
                        }else{
                            MatchDetail.deleteOne(query, err => {
                                if(err){
                                    console.log(err);
                                }else{
                                    res.send('Deleted!!');
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});


module.exports = router;