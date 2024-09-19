import { load_stage, moveCorepart } from './impossible-shapes.js';
var mqtt;
var reconnectTimeout = 2000;
var host="localhost";
var port=8083;

var page="rtp";

const textBackgroundColors = ['#F44336', '#7AC42E', '#5AC8FA', '#FFCC00'];
const colorNames = ['red','green', 'blue', 'yellow'];
var correct_audio = document.getElementById('correct');
var incorrect_audio = document.getElementById('incorrect');
var end_audio = document.getElementById('end');
var stage = 0;
var score = 0;
var total_stages = 10;
var textColorName = "";
var textBGColor = "";
var cg_answer = "";
var quiz_answer = "";
var colorIndex = 0;
var quiz_answers = ['red','red','red','red','red','red'];

function onMessageArrived(message){
	var button=message.payloadString;
    console.log(button);
    if(page==="rtp"){
        $('#rtp').hide();
        $('#pickGame').show();
        page="pickGame";
        AOS.init();
    }else if(page==="pickGame" && button==="red"){
        $('#pickGame').hide();
        $('#select-language').show();
        page="select-language";
        AOS.init();
    }else if(page==="select-language" && button==="blue"){
        $('select-language').hide();
        $('#rtp').show();
        page="rtp";
    }else if(page==="select-language" && button==="yellow"){
        $('select-language').hide();
        $('#rtp').show();
        page="rtp";
    }else if(page==="pickGame" && button==="blue"){
        $('#pickGame').hide();
        $('#htp_cg').show();
        page="htp_cg";
        AOS.init();
    }else if(page==="htp_cg"){
        $('#htp_cg').hide();
        process_cg_move("start");
        $('#color_game').show();
        page="color_game";
    }else if(page==="color_game"){
        var last_ping = new Date();
        process_cg_move(button);
    }else if(page==="cg_score" && button==="blue"){
        $('#game-result').hide();
        $('#rtp').show();
        page="rtp";
    }else if(page==="cg_score" && button==="red"){
        $('#game-result').hide();
        var last_ping = new Date();
        process_cg_move("start");
        $('#color_game').show();
        page="color_game";
    }else if(page==="pickGame" && button==="green"){
        $('#pickGame').hide();
        $('#htp_quiz').show();
        page="htp_quiz";
        AOS.init();
    }else if(page==="htp_quiz"){
        $('#htp_quiz').hide();
        $('#quiz_game').show();
        page="quiz_game";
        process_quiz_move("start");
    }else if(page=="quiz_game"){
        process_quiz_move(button);
    }else if(page==="quiz_score" && button==="red"){
        $('#game-result').hide();
        process_quiz_move("start");
        $('#quiz_game').show();
        page="quiz_game";
    }else if(page==="quiz_score" && button==="blue"){
        $('#game-result').hide();
        $('#rtp').show();
        page="rtp";
    }else if(page==="pickGame" && button==="yellow"){
        $('#pickGame').hide();
        $('#impossible-way').css('display','flex');
        console.log("loading stage...");
        load_stage(1);
        page="impossible-way";
    }else if(page==="impossible-way"){
        moveCorepart();
    }
}

function process_cg_move(button)
{
    try{
        last_ping = new Date();
        if(button==="start")
        {
            stage=0; 
            score=0;
        }
        stage = stage + 1;
        if(stage>1 && button==cg_answer)
        {
            score++;
            console.log("SCORE:",score);
        }
        console.log("stage:",stage);
        if(stage>10)
        {
            $('#color_game').hide();
            $('#game-result').show();
            $('#score').html(score.toString());
            page="cg_score";
        } 
        let random1 = Math.floor(Math.random() * 4);
        let random2;
        do {
            random2 = Math.floor(Math.random() * 4);
        } while (random2 === random1);
        let random3;
        do {
            random3 = Math.floor(Math.random() * 4);
        } while (random3 === random2 || random3 === random1);
        
        textBGColor = textBackgroundColors[random1];
        cg_answer = colorNames[random1];
        textColorName = colorNames[random2];
        screenBG = textBackgroundColors[random3];
        colorIndex = random1;
        $('#text-section-cg').css("background-color",screenBG);
        $('#colorText').css("color",textBGColor);
        $('#colorText').html(textColorName);
    }catch(err) {
        console.log(err.message);
    }
}

function process_quiz_move(button)
{
    try{
        last_ping = new Date();
        if(button==="start")
        {
            stage=0;
            score=0;
        }
        stage = stage + 1;
        if(stage>1 && button==quiz_answer)
        {
            score++;
            console.log("SCORE:",score);
        }
        console.log("stage:",stage);
        if(stage>5)
        {
            $('#quiz_game').hide();
            $('#game-result').show();
            $('#score').html(score.toString());
            page="quiz_score";
        }else{
            $('#cq1, #cq2, #cq3, #cq4, #cq5').hide();
            $('#cq'+stage).show();
            quiz_answer = quiz_answers[stage];
        }
    }catch(err) {
        console.log(err.message);
    }
}

function onFailure(message) {
    console.log("Connection Attempt to Host "+host+"Failed");
    setTimeout(MQTTconnect, reconnectTimeout);
}

function onConnect() {
    console.log("Connection Successful!");
    mqtt.subscribe("button");
    console.log("Subscribed to button!");
}

function MQTTconnect() {
    console.log("connecting to "+ host +" "+ port);
    var x=Math.floor(Math.random() * 10000); 
    var cname="orderform-"+x;
    mqtt = new Paho.MQTT.Client(host,port,cname);
    var options = {
            timeout: 5,
            reconnect: true,
            onSuccess: onConnect,
            onFailure: onFailure
        };
    mqtt.onMessageArrived = onMessageArrived

    mqtt.connect(options); //connect
}

MQTTconnect();

function send_message(message)
{
    console.log(message);
    message = new Paho.MQTT.Message(message);
    message.destinationName = "button";
    mqtt.send(message);
}
