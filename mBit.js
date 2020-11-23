// Remote Example1 - reciever
// for CHIRIMEN with:microbit

//プレイヤーの定数
const PLAYER1 = 1;
const PLAYER2 = 2;
const SPECTATOR = -1;

//プレイヤーのデータ
const player1_exist = "player1_exist";
const player1_name = "player1_name";
const player1_sensorData = "player1_sensorData";
const player1_time = "player1_time";

const player2_exist = "player2_exist";
const player2_name = "player2_name";
const player2_sensorData = "player2_sensorData";
const player2_time = "player2_time";


let microBitBle;

let getData = false;

let getPlayerChannel;

let inChannel;
let outChannel;

let relay;

let mdata = {
	player1_exist: false,
	player2_exist: false
};

let sending = {
	userId: "default",
	witchPlayer: SPECTATOR
};

let player;
let playerData;

let isWatch = false;

async function connect()
{
	var Log = document.getElementById("log");

	Log.innerHTML = "少々お待ちください...";

	alert("micro:bitと接続してください");

	// chirimen with micro:bitの初期化
	microBitBle = await microBitBleFactory.connect();

	// msgDiv.innerHTML=("micro:bitとのBLE接続が完了しました");
	console.log("micro:bitとのBLE接続が完了しました。");

	Log.innerHTML = "少々お待ちください...";

	//RelayToSetPlayer();
	let GettingDataRelay = await RelayServer("achex", "chirimenSocket" );
	let GettingDataChannel;
	GettingDataChannel = await GettingDataRelay.subscribe("chirimenGetPlayer");

	GettingDataChannel.onmessage = setGetFlag;

	relay = await RelayServer("achex", "chirimenSocket" );
	inChannel = await relay.subscribe("chirimenGetPlayer");
	outChannel = await relay.subscribe("chirimenMbitSensors");

	for (let i = 0; i < 1000; i++)//データが来るまで待機
	{
		if (getData)
		{
			console.log("データが来ました");
			break;
		}

		if (i % 500 === 0)
		{
			console.log(i / 500);
		}
		
		await sleep(1);
	}


	if (!getData)//setGetFlagが呼び出されなかったとき(なにもメッセージが来なかった場合)
	{
		player = PLAYER1;
		console.log("データは来ませんでした");
	}

	alert("準備が整いました！");
	Log.innerHTML = `${document.getElementById("userName").value} さん、それではお楽しみください！`;

	sendingData();
}

async function no()
{
}

function setGetFlag(msg)
{
	setPlayer(msg);
}

function setPlayer(msg)
{
	getData = true;
	mdata = msg.data;

	if (player == undefined)
	{
		if (mdata.player1_exist)
		{
			player = PLAYER2;
		} else {
			player = PLAYER1;
		}
	}
}

async function sendingData()
{
	let userName = document.getElementById("userName").value;
	let username = userName;
	
	while (true)
	{
		let sensorData = await microBitBle.readSensor();
		let time = new Date().toString();

		sending.userId = username;
		sending.witchPlayer = player;

		sending.sensorData = sensorData;
		sending.time = time;

		console.log(`name: ${sending.userId}\nwitchPlayer: ${sending.witchPlayer}`);

		outChannel.send(sending);

		await sleep(1000);
	}
}