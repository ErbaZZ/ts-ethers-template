import { BigNumber, ethers } from 'ethers';
import axios from 'axios';
import 'dotenv/config';
import { ERC20_ABI } from './abi';
import { USDC_ADDRESS } from './address';

const RPC_URL = process.env.RPC_URL || '';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const LINE_NOTI_KEY = process.env.LINE_NOTI_KEY || '';

const NOTIFY = LINE_NOTI_KEY ? true : false;

const LINE_NOTI_CONFIG = { headers: { Authorization: `Bearer ${LINE_NOTI_KEY}` } };
const LINE_NOTI_URL = 'https://notify-api.line.me/api/notify';

const EXPECTED_PONG_BACK = 15000;
const KEEP_ALIVE_CHECK_INTERVAL = 7500;

if (RPC_URL === '') {
	console.warn('Must provide RPC_URL environment variable');
	process.exit(1);
}

if (PRIVATE_KEY === '') {
	console.warn('Must provide PRIVATE_KEY environment variable');
	process.exit(1);
}

let provider: ethers.providers.WebSocketProvider;
let wallet: ethers.Wallet;

// TODO: Declare your contracts here
// let usdc: ethers.Contract;

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

const sendLineNotification = async (message: string) => {
	return axios.post(LINE_NOTI_URL, `message=${encodeURIComponent(message)}`, LINE_NOTI_CONFIG);
};

async function connect() {
	if (NOTIFY) sendLineNotification(`Starting...`);
	console.log('Connecting...');
	provider = new ethers.providers.WebSocketProvider(RPC_URL);
	wallet = new ethers.Wallet(PRIVATE_KEY, provider);

	// TODO: Create your contract instances here
	// usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);

	let pingTimeout: NodeJS.Timeout;
	let keepAliveInterval: NodeJS.Timer;

	// TODO: Create your interval here
	// let checkQueueInterval: NodeJs.Timer = null;

	provider._websocket.on('open', () => {
		console.log('Connected!');
		keepAliveInterval = setInterval(() => {
			// console.log('Checking if the connection is alive, sending a ping')
			provider._websocket.ping();

			pingTimeout = setTimeout(() => {
				provider._websocket.terminate();
			}, EXPECTED_PONG_BACK);
		}, KEEP_ALIVE_CHECK_INTERVAL);

		// TODO: Set your interval here
		// checkQueueInterval = setInterval(checkQueue, QUEUE_CHECK_INTERVAL);
	});

	provider._websocket.on('close', () => {
		console.error('The websocket connection was closed');
		clearInterval(keepAliveInterval);

		// TODO: Clear your interval here
		// clearInterval(checkQueueInterval);

		clearTimeout(pingTimeout);

		provider.removeAllListeners();
		provider.destroy();

		connect();
	});

	provider._websocket.on('pong', () => {
		// console.log('Received pong, so connection is alive, clearing the timeout')
		clearInterval(pingTimeout);
	});

	// TODO: Add your event listener here
	// const triggerLiquidationFilter = core.filters.TriggerLiquidation();
	// core.on(triggerLiquidationFilter, triggerLiquidationEventHandler);

	provider.on('block', async (blockNum) => {
		// console.log(blockNum);
		
		// TODO: Add things to do every block
	});

	provider.on('pending', async (txHash) => {
		// console.log(txHash);

		// TODO: Process pending tx
		// const tx = await provider.getTransaction(txHash);
		// console.log(tx)
	});
}

async function main() {
	await connect();

	// Call
	// const usdcBalance = (await usdc.functions.balanceOf(wallet.address))[0];

	// Simulate Tx
	// try {
	// 	await liquidator.callStatic.flLiqSwap(borrower, collateral, colType, swapTx);
	// } catch (e) {
	// 	console.log('Tx Simulation Failed: ', e);
	// 	liq = false;
	// }

	// Send Tx
	// const tx = await liquidator.functions.flLiqSwap(borrower, collateral, colType, swapTx, {
	// 	gasPrice: (await wallet.getGasPrice()).mul('2'),
	// });
	// console.log(`https://ftmscan.com/tx/${tx.hash}`);
	// if (NOTIFY) sendLineNotification(`Liquidating... https://ftmscan.com/tx/${tx.hash}`);
	// const receipt = await tx.wait();
}

main()
	.then(async () => {})
	.catch((e) => {
		console.error(e);
		process.exit(1);
	});
