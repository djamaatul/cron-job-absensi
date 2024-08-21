import { CronJob } from 'cron';
import { parentPort, workerData } from 'worker_threads'
import login from '../utils/login.js';

const absensiMasuk = async ({ headers, body } = {}) => {
	const response = await fetch(URL_MASUK, {
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
	}).then(async (e) => e.json()).catch(e => null);
	parentPort.postMessage(response)
};

const intervalMasuk = workerData.intervalMasuk;

console.log(`ABSENSI MASUK START: ${[...intervalMasuk.seconds]} ${[...intervalMasuk.minutes]} ${[...intervalMasuk.hours]} * * *`);

new CronJob(
	`${[...intervalMasuk.seconds]} ${[...intervalMasuk.minutes]} ${[...intervalMasuk.hours]} * * *`,
	async function () {
		const currentTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
		const match = workerData.dataAbsensiMasuk.find((e) => e.tanggalMasuk === currentTime);
		if (!match) return;

		const { tanggalMasuk, ...body } = match;
		await login();
		await absensiMasuk({
			body
		});
	},
	null,
	true,
	'Asia/Jakarta'
);