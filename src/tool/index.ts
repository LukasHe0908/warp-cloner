import * as warp from '../warp';
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
  '将WARP升为WARP+',
  '获取KWARP信息',
  //   '选项 4',
  //   '选项 5',
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
              const key =
                config.BASE_KEYS[
                  Math.floor(Math.random() * config.BASE_KEYS.length)
                ];
              console.log(menu_text.pls_wait);
              const res = await warp.cloneKey(key, null, parsedJson);
              console.log(res);
            } else {
              console.log(menu_text.return_main);
            }
          });
        } catch (error) {
          console.error(menu_text.invalid_data, error.message);
          rl.question(menu_text.confirm_no, async text => {
            if (text.toLocaleLowerCase() === 'y') {
              const key =
                config.BASE_KEYS[
                  Math.floor(Math.random() * config.BASE_KEYS.length)
                ];
              console.log(menu_text.pls_wait);
              const res = await warp.cloneKey(key);
              console.log(res);
            } else {
              console.log(menu_text.return_main);
            }
          });
        }
      });
      break;
    case '2':
      console.clear();
      console.log(`----- ${feature_name[2]} -----`);

      rl.question(menu_text.input_text + '格式[id,token]\n', (text: any) => {
        text = text.split(',');
        text = { id: text[0], token: text[1] };
        console.log(menu_text.parased_data, text);
        rl.question(menu_text.confirm_yes, async yn => {
          if (yn.toLocaleLowerCase() !== 'n') {
            const key =
              config.BASE_KEYS[
                Math.floor(Math.random() * config.BASE_KEYS.length)
              ];
            const path = `v0a${Math.floor(Math.random() * 900) + 100}`;
            const referrerBody = {
              referrer: text.id,
            };
            console.log(menu_text.pls_wait);
            const registerData = await warp.getInfo(path, text.id, text.token);

            await warp.register(path, referrerBody);

            await warp.addKey(path, text.id, text.token, key);
            await warp.addKey(
              path,
              text.id,
              text.token,
              registerData.account.license
            );
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

      rl.question(menu_text.input_text + '格式[id,token]\n', (text: any) => {
        text = text.split(',');
        text = { id: text[0], token: text[1] };
        console.log(menu_text.parased_data, text);
        rl.question(menu_text.confirm_yes, async yn => {
          if (yn.toLocaleLowerCase() !== 'n') {
            const path = `v0a${Math.floor(Math.random() * 900) + 100}`;
            console.log(menu_text.pls_wait);
            const registerData = await warp.getInfo(path, text.id, text.token);
            console.log(registerData);
            console.log(menu_text.return_main);
          } else {
            console.log(menu_text.return_main);
          }
        });
      });
      break;
    case '4':
      console.log('你选择了选项4');
      displayMenu();
      break;
    case '5':
      console.log('你选择了选项5');
      displayMenu();
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
