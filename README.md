# Front
The front can be launch with :  
cd ./proxy/proxyFront && npm run start  

# Back
The back can be launch for dev with :  
cd ./proxy/backEnd && npm run dev  
Or for exploitation with :  
cd ./proxy/backEnd && npm run start  

# How deploy the backend on a vm or a remote server :
on source : cd ./proxy/backEnd && npm run build  
on source : cd ../shared && npx tsc  
then  
ssh user@127.0.0.1 "mkdir -p \~/proxy/backEnd"  
ssh user@127.0.0.1 "mkdir -p \~/proxy/shared"  
scp -r ./backEnd/{build,package.json} user@127.0.0.1:~/proxy/backEnd/  
scp -r ./shared/{src,package.json} user@127.0.0.1:\~/proxy/shared/  
then  
ssh user@127.0.0.1 "cd ~/proxy/shared/ && npm i && npm link"  
ssh user@127.0.0.1 "cd ~/proxy/backEnd/ && npm i &&  npm link personnal-shared"
ssh user@127.0.0.1 "cd ~/proxy/backEnd/ && nohup node ./build/index.js  &"  
ssh user@127.0.0.1 "tail -f nohup.out"  
  
You should be aware that you have to handle port redirection, firewall rules and others network things.  

# Utilities :
blackListCleaner.py :  
You can create black list file from dns blacklist or raw black list file.  
A raw black list file is a file containing one url per line.  
A bns blacklist file a a file on the form : ip url.  
  
Example of raw black list :  
adsroller.com  
www.m4.moonshoe.live  
www.mail.foccr.com  
poczta.identyfikacja-uzytkownika.pw  
www.the-discount-store.com  
btwkp.zalzos.com  
  
Example of dns black list :  
0.0.0.0 3vulkanvegas.com  
0.0.0.0 4fpl.com  
0.0.0.0 4ksport.pl  
0.0.0.0 4life.com  
  
To merge some black list file :  
python3 blackListCleaner.py pythonfile1_path file2_path output_file_path  
Then, use the output file with the proxy to black adds and trackers or for parental control.  

