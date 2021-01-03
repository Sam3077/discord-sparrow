import { exec } from "child_process";

export default function awaitVPNConnection(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        function checkConnected(interval?: NodeJS.Timeout) {
            exec('piactl get connectionstate', (err, stdout, stderr) => {
                if (err || stderr) {
                    if (interval) {
                        clearInterval(interval);
                    }
                    reject(err || stderr);
                    return;
                }
                if (stdout.trim() === 'Connected') {
                    if (interval) {
                        clearInterval(interval);
                    }
                    resolve();
                }
            });
        }

        checkConnected();
        let retryCount = 0;
        const maxRetries = 10;
        const interval = setInterval(() => {
            checkConnected(interval);
            retryCount++;
            if (retryCount > maxRetries) {
                clearInterval(interval);
                exec('piactl disconnect');
                reject(`Failed to connect after ${maxRetries} attempts`);
            }
        }, 2000);
    });
}