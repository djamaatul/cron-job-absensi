import { CronJob } from 'cron';
import { parentPort, workerData } from 'worker_threads'
import login from '../utils/login.js';
import moment from 'moment';
import getRandomLocation from '../utils/getRandomLocation.js';

const absensiPulang = async ({ headers, body } = {}) => {
	if(!body.lokasi){
		body.lokasi = getRandomLocation();
	}
	const response = await fetch(process.env.URL_PULANG, {
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"X-Requested-With": "XMLHttpRequest",
			...headers
		},
		method: "POST",
		credentials: "include",
		body: new URLSearchParams({
			...body
		})
	}).then(async (e) => e.json()).catch(e => e);
	parentPort.postMessage(response);
};

const intervalPulang = workerData.intervalPulang;

console.log(`ABSENSI PULANG START: ${[...intervalPulang.seconds]} ${[...intervalPulang.minutes]} ${[...intervalPulang.hours]} * * *`);

new CronJob(
	`${[...intervalPulang.seconds]} ${[...intervalPulang.minutes]} ${[...intervalPulang.hours]} * * *`,
	async function () {
		console.log('Execute Pulang..')
		const currentTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
		const match = workerData.dataAbsensiPulang.find((e) => e.tanggalPulang === currentTime);
		if (!match) return;
		console.log('MATCH!', match)
		
		const { tanggalPulang, ...body } = match;

		const Cookie = await login();
		await absensiPulang({
			body,
			headers: {
				Cookie
			}
		});

	},
	null,
	true,
	'Asia/Jakarta'
);