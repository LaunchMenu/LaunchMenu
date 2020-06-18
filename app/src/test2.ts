import getMyApp from "./test";

const MyApp = getMyApp({appID: "shit", getSubContext: () => null});
MyApp.doOtherShit();
MyApp.poop();
MyApp.getCut();

let x = new MyApp(1);
x.doShit();

x.doPoop();
x.nWord();
