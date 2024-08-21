import { CronJob } from 'cron';
import moment from 'moment';
import { parentPort } from 'worker_threads'

new CronJob(
	'0 0 * * * *',
	function(){
		parentPort.postMessage(moment().format('YYYY-MM-DD HH:mm'))
	},
	null,
	true
)