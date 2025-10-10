function calculate(z) {
    const add = function(a, b) {
        return a + b;
    }
    let x = 10;
    let y = 20;
    let result = add(x, y) + z;
    const add2 = (a, b) => (a + b);
    result += add2(x, y);
    return result;
}
console.log(calculate(1000));