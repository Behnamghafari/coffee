// console.log("\x1Bc");
// console.log((new Date()).toLocaleString('fa'))
module.exports.clearLogger = ((req,res,next)=>{
    // console.log("\x1Bc");
    console.clear()
    console.log((new Date()).toLocaleString('fa'))
    console.log(req.method + " " +req.hostname +":"+process.env.port+req.url);
    const startTime = Date.now();
    const originalSend = res.send;
    res.send = function (body) {
        // محاسبه اندازه بدنه پاسخ
        const sizeInBytes = Buffer.byteLength(body, "utf8"); // اندازه بدنه به بایت
        const sizeInKB = sizeInBytes / 1024; // تبدیل به کیلوبایت
        console.log(`Response size: ${sizeInKB.toFixed(2)} KB`);
        // فراخوانی متد اصلی send
        return originalSend.call(this, body);
    };
    next();
    const duration = Date.now() - startTime;
    console.log("request durtion: " + duration +"ms")
   
})