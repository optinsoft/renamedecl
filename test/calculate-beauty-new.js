function v1(v8) {
    const v1 = function (v1, v2) {
        return v1 + v2;
    };
    let v2 = 10;
    let v3 = 20;
    let v4 = v1(v2, v3) + v8;
    const v7 = (v5, v6) => v5 + v6;
    v4 += v7(v2, v3);
    return v4;
}
console.log(v1(1000));