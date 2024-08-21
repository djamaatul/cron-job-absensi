import 'dotenv/config.js';
import exceljs from 'exceljs';
import { fileURLToPath } from 'url';
import path from 'path';
import moment from 'moment';
import { Worker } from 'worker_threads';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ws = new exceljs.Workbook();

function sheetToJson(ws, eachRow) {
	let rows = [];
	ws.eachRow((row, indexRow) => {
		const values = {};
		row.eachCell((e, i) => {
			if (e.value) {
				values[ws.columns[i - 1].key] = e.value;
			}
		});
		if(indexRow>1){
			eachRow?.(values);
		}
		rows.push(values);
	});
	rows = rows.slice(1);
	return rows;
}

const intervalMasuk = {
	hours: new Set(),
	minutes: new Set(),
	seconds: new Set()
};

const intervalPulang = {
	hours: new Set(),
	minutes: new Set(),
	seconds: new Set()
};

(async () => {
	const dataAbsensiMasuk = await ws.csv.readFile(__dirname + '/../absensi_masuk.csv').then(ws => {
		ws.columns = [
			{
				header: 'Tanggal Masuk',
				key: 'tanggalMasuk'
			},
			{
				header: 'Via',
				key: 'via'
			},
			{
				header: 'Kondisi',
				key: 'kondisi'
			},
			{
				header: 'Lokasi',
				key: 'lokasi'
			},
			{
				header: 'Alamat',
				key: 'alamat'
			},
			{
				header: 'Keterangan',
				key: 'keterangan'
			}
		];
		return sheetToJson(ws, (item) => {
			const hour = moment(item.tanggalMasuk, 'YYYY-MM-DD HH:mm:ss').format('HH');
			const minute = moment(item.tanggalMasuk, 'YYYY-MM-DD HH:mm:ss').format('mm');
			const second = moment(item.tanggalMasuk, 'YYYY-MM-DD HH:mm:ss').format('ss');
			intervalMasuk.hours.add(hour);
			intervalMasuk.minutes.add(minute);
			intervalMasuk.seconds.add(second);
		});
	});

	const dataAbsensiPulang = await ws.csv.readFile(__dirname + '/../absensi_pulang.csv').then((ws => {
		ws.columns = [
			{
				header: 'Tanggal Pulang',
				key: 'tanggalPulang'
			},
			{
				header: 'Via',
				key: 'via'
			},
			{
				header: 'Kondisi',
				key: 'kondisi'
			},
			{
				header: 'Lokasi',
				key: 'lokasi'
			},
			{
				header: 'Alamat',
				key: 'alamat'
			},
			{
				header: 'Keterangan',
				key: 'keterangan'
			},
			{
				header: 'Aktivitas',
				key: 'aktivitas'
			}
		];
		return sheetToJson(ws, (item) => {
			const hour = moment(item.tanggalPulang, 'YYYY-MM-DD HH:mm:ss').format('HH');
			const minute = moment(item.tanggalPulang, 'YYYY-MM-DD HH:mm:ss').format('mm');
			const second = moment(item.tanggalPulang, 'YYYY-MM-DD HH:mm:ss').format('ss');
			intervalPulang.hours.add(hour);
			intervalPulang.minutes.add(minute);
			intervalPulang.seconds.add(second);
		});
	}));

	const workerMasuk = new Worker(__dirname+'/workers/worker_masuk.js', { workerData: {
		dataAbsensiMasuk,
		intervalMasuk
	}})
	workerMasuk.on('message', (response)=> {
		console.log(`Status Absensi Masuk:`, response);
	})

	const workerPulang = new Worker(__dirname+'/workers/worker_pulang.js', { workerData: {
		dataAbsensiPulang,
		intervalPulang
	}})
	workerPulang.on('message', (response)=> {
		console.log(`Status Absensi Pulang:`, response);
	})

	const workerHourTick = new Worker(__dirname+'/workers/worker_hour_tick.js')
	workerHourTick.on('message', (time)=> {
		console.log(time);
	})
})();