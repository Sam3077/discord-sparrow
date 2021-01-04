import { exec } from "child_process";
import privateConfig from './private-config.json';

function awaitStatus(statusTerm: string, maxRetries: number): Promise<void> {
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
                if (stdout.trim() === statusTerm) {
                    if (interval) {
                        clearInterval(interval);
                    }
                    resolve();
                }
            });
        }

        checkConnected();
        let retryCount = 0;
        const interval = setInterval(() => {
            checkConnected(interval);
            retryCount++;
            if (retryCount > maxRetries) {
                clearInterval(interval);
                exec('piactl disconnect');
                reject(`Failed to achieve status after ${maxRetries} attempts`);
            }
        }, 2000);
    });
}
export function awaitVPNConnection(): Promise<void> {
    return awaitStatus("Connected", 10);
}

export function awaitVPNDisconnection(): Promise<void> {
    return awaitStatus("Disconnected", 10);
}

export function startOpenVPN(): Promise<void> {
    return new Promise<void>((resolve) => {
        exec(`echo ${privateConfig.sudoPassword} | sudo -S openvpn --config /etc/openvpn/pia.conf`);
        setTimeout(resolve, 1000);
    })
}
export function killOpenVPN(): Promise<void> {
    return new Promise<void>((resolve) => {
        exec(`echo ${privateConfig.sudoPassword} | sudo -S killall openvpn`);
        setTimeout(resolve, 1000);
    })
}