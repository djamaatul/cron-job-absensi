import { CronJob } from 'cron';
import { parentPort, workerData } from 'worker_threads'
import login from '../utils/login.js';

const absensiPulang = async ({ headers, body } = {}) => {
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
	}).then(async (e) => e.json()).catch(e => {
		return e;
	});
	parentPort.postMessage(response);
};

const intervalPulang = workerData.intervalPulang;

console.log(`ABSENSI PULANG START: ${[...intervalPulang.seconds]} ${[...intervalPulang.minutes]} ${[...intervalPulang.hours]} * * *`);

new CronJob(
	`${[...intervalPulang.seconds]} ${[...intervalPulang.minutes]} ${[...intervalPulang.hours]} * * *`,
	async function () {

		const currentTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
		const match = workerData.dataAbsensiPulang.find((e) => e.tanggalPulang === currentTime);

		if (!match) return;

		const { tanggalPulang, ...body } = match;

		await login();
		await absensiPulang({
			body
		});

	},
	null,
	true,
	'Asia/Jakarta'
);