//异步示例 https://github.com/laverdet/isolated-vm/issues/322#issuecomment-2131419114
const { Isolate, Reference, ExternalCopy } = require("isolated-vm");

(async function () {
    const isolate = new Isolate()

    async function myAsyncFunction() {
        return new Promise((resolve) => {
            setTimeout(() => resolve('Hello from async function in isolate!'), 10);
        });
    }

    const context = await isolate.createContext();
    const jail = context.global;
    await jail.set('myAsyncFunction', new Reference(myAsyncFunction));

    const fn = await context.eval(`
        (async function untrusted(staff, params) {
            let str = await myAsyncFunction.applySyncPromise();
            return [1, 2, 3];
        })
    `, { reference: true })

    const value = await fn.apply(
        undefined,
        [
            new ExternalCopy({id:1}).copyInto(),
            new ExternalCopy({name:"abc"}).copyInto()
        ],
        { result: { promise: true, copy: true } }
    )
    console.log(value) // 'Hello from async function in isolate!'
})()
