import * as warp from '../warp';
import { WireGuard } from '../utils/wireguard';
import config from '../config';
import readline from 'readline';
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const feature_name = [
  // title
  '功能选择',
  // menu
  '自定义KeyClone注册POST JSON',
  '注册WARP账号',
  '获取WARP账号信息',
  '获得reserved值(config.client_id)',
  '删除WARP账号',
  //   '选项 6',
  //   '选项 7',
  //   '选项 8',
  //   '选项 9',
];
const menu_text = {
  exit: '\n0. 退出',
  return_main: '\n请按换行键返回主菜单...',
  confirm_yes: 'Are you sure?(Y\\n)',
  confirm_no: 'Are you sure?(y\\N)',
  pls_wait: '请稍等...',
  input_json: '请输入JSON: ',
  input_text: '请输入文本: ',
  parased_data: '解析后的数据: ',
  invalid_data: '无效的数据: ',
  error: '发生错误: ',
};

function displayMenu() {
  console.clear();
  feature_name.forEach((value, index) => {
    if (index === 0) {
      console.log(`----- ${value} -----`);
    } else {
      console.log(`${index}. ${value}`);
    }
  });
  console.log(menu_text.exit);
}

async function handleInput(option) {
  switch (option) {
    case '0':
      rl.close();
      break;
    default:
      displayMenu();
      break;
    case '1':
      console.clear();
      console.log(`----- ${feature_name[1]} -----`);

      rl.question(menu_text.input_json, json => {
        try {
          const parsedJson = JSON.parse(json);
          console.log(menu_text.parased_data, parsedJson);
          rl.question(menu_text.confirm_no, async yn => {
            if (yn.toLocaleUpperCase() == 'Y') {
              try {
                const key =
                  config.BASE_KEYS[
                    Math.floor(Math.random() * config.BASE_KEYS.length)
                  ];
                console.log(menu_text.pls_wait);

                const res = await warp.cloneKey(key, null, parsedJson);
                console.log(res);
              } catch (error) {
                console.error(menu_text.error, error.message);
                console.log(menu_text.return_main);
              }
            } else {
              console.log(menu_text.return_main);
            }
          });
        } catch (error) {
          console.error(menu_text.invalid_data, error.message);
          console.log(menu_text.return_main);
        }
      });
      break;
    case '2':
      console.clear();
      console.log(`----- ${feature_name[2]} -----`);

      rl.question(menu_text.input_text + '格式[key]\n', (text: any) => {
        text = text.split(',');
        text = { key: text[0] };
        console.log(menu_text.parased_data, text);
        rl.question(menu_text.confirm_yes, async yn => {
          if (yn.toLocaleLowerCase() !== 'n') {
            const path = `v0a${Math.floor(Math.random() * 900) + 100}`;
            const private_key = WireGuard.genkey();
            const registerBody = {
              fcm_token: '',
              install_id: '',
              key: WireGuard.pubkey(private_key),
              locale: 'en_US',
              model: 'PC',
              tos: new Date().toISOString(),
              type: 'Android',
            };
            console.log(menu_text.pls_wait);
            try {
              const registerData = await warp.register(path, registerBody);
              const referrerBody = {
                fcm_token: '',
                install_id: '',
                key: WireGuard.pubkey(WireGuard.genkey()),
                locale: 'en_US',
                model: 'PC',
                tos: new Date().toISOString(),
                type: 'Android',
                referrer: registerData.id,
              };
              const referrerData = await warp.register(path, referrerBody);
              await warp.addKey(
                path,
                registerData.id,
                registerData.token,
                text.key
              );
              await warp.addKey(
                path,
                registerData.id,
                registerData.token,
                registerData.account.license
              );
              console.log('client_id:');
              console.log(registerData.config.client_id);
              console.log('addresses_v6:');
              console.log(registerData.config.interface.addresses.v6);
              console.log('id,token:');
              console.log(registerData.id + ',' + registerData.token);
              console.log('private_key:');
              console.log(private_key);
            } catch (error) {
              console.error(menu_text.error, error.message);
            }
            console.log(menu_text.return_main);
          } else {
            console.log(menu_text.return_main);
          }
        });
      });
      break;
    case '3':
      console.clear();
      console.log(`----- ${feature_name[3]} -----`);

      rl.question(
        menu_text.input_text + '格式[id,token,*to_string=false]\n',
        (text: any) => {
          text = text.split(',');
          text = { id: text[0], token: text[1], to_string: text[2] };
          console.log(menu_text.parased_data, text);
          rl.question(menu_text.confirm_yes, async yn => {
            if (yn.toLocaleLowerCase() !== 'n') {
              const path = `v0a${Math.floor(Math.random() * 900) + 100}`;
              console.log(menu_text.pls_wait);
              try {
                const registerData = await warp.getInfo(
                  path,
                  text.id,
                  text.token
                );
                if (text.to_string) {
                  console.log(JSON.stringify(registerData));
                } else {
                  console.log(registerData);
                }
              } catch (error) {
                console.error(menu_text.error, error.message);
              }
              console.log(menu_text.return_main);
            } else {
              console.log(menu_text.return_main);
            }
          });
        }
      );
      break;
    case '4':
      console.clear();
      console.log(`----- ${feature_name[4]} -----`);

      rl.question(
        menu_text.input_text + '格式[config.client_id]\n',
        (text: any) => {
          text = text.split(',');
          text = { client_id: text[0] };
          console.log(menu_text.parased_data, text);
          rl.question(menu_text.confirm_yes, async yn => {
            if (yn.toLocaleLowerCase() !== 'n') {
              function decodeClientId(clientId: string): number[] {
                const decodedBuffer: Buffer = Buffer.from(clientId, 'base64');
                const hexString: string = decodedBuffer.toString('hex');
                const hexPairs: string[] = hexString.match(/.{1,2}/g) || [];
                const decimalArray: number[] = hexPairs.map(hex =>
                  parseInt(hex, 16)
                );
                return decimalArray;
              }
              const data = decodeClientId(text.client_id);
              console.log(data);
              console.log(menu_text.return_main);
            } else {
              console.log(menu_text.return_main);
            }
          });
        }
      );
      break;
    case '5':
      console.clear();
      console.log(`----- ${feature_name[5]} -----`);

      rl.question(menu_text.input_text + '格式[id,token]\n', (text: any) => {
        text = text.split(',');
        text = { id: text[0], token: text[1], to_string: text[2] };
        console.log(menu_text.parased_data, text);
        rl.question(menu_text.confirm_yes, async yn => {
          if (yn.toLocaleLowerCase() !== 'n') {
            const path = `v0a${Math.floor(Math.random() * 900) + 100}`;
            console.log(menu_text.pls_wait);
            try {
              await warp.deleteAccount(path, text.id, text.token);
            } catch (error) {
              console.error(menu_text.error, error.message);
            }
            console.log(menu_text.return_main);
          } else {
            console.log(menu_text.return_main);
          }
        });
      });
      break;
    case '6':
      console.log('你选择了选项6');
      displayMenu();
      break;
    case '7':
      console.log('你选择了选项7');
      displayMenu();
      break;
    case '8':
      console.log('你选择了选项8');
      displayMenu();
      break;
    case '9':
      console.log('你选择了选项9');
      displayMenu();
      break;
  }
}

displayMenu();

rl.on('line', input => {
  handleInput(input.trim());
});
