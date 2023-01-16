import { spawn } from "child_process";
import { print } from "gluegun";

export const runArkb = async (wallet: string, directory: string) => {
    if (!wallet) {
        print.error('Error deploying: No wallet provided.')
    }

    const arkb = spawn('arkb', ['deploy', `-w ${wallet}`], { shell: true });
    arkb.stdout.on('data', (data) => {
        console.log(data.toString());
        
        console.log(`stdout: ${data}`);
        process.exit(1)
      });
    
      arkb.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      });
    
      arkb.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
      });

      return arkb;
}

module.exports = { runArkb }