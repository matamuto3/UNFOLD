const fs = require("fs");
const path = require("path");

const I32 = 0x7f;
const FUNC = 0x60;

function u32(value) {
  const bytes = [];
  let current = value >>> 0;
  do {
    let byte = current & 0x7f;
    current >>>= 7;
    if (current) {
      byte |= 0x80;
    }
    bytes.push(byte);
  } while (current);
  return bytes;
}

function vec(items) {
  return [...u32(items.length), ...items.flat()];
}

function str(value) {
  const bytes = Buffer.from(value, "utf8");
  return [...u32(bytes.length), ...bytes];
}

function section(id, payload) {
  return [id, ...u32(payload.length), ...payload];
}

function funcType(params, results) {
  return [FUNC, ...vec(params), ...vec(results)];
}

function locals(groups) {
  return vec(groups.map(([count, type]) => [...u32(count), type]));
}

function body(localGroups, code) {
  const payload = [...locals(localGroups), ...code, 0x0b];
  return [...u32(payload.length), ...payload];
}

const typeSection = section(1, vec([
  funcType([I32, I32], []),
  funcType([I32, I32], [I32]),
  funcType([I32, I32, I32], []),
  funcType([I32, I32, I32, I32, I32], []),
]));

const functionSection = section(3, vec([
  u32(0), // clear(ptr, len)
  u32(1), // count_nonzero(ptr, len) -> i32
  u32(1), // max_u8(ptr, len) -> i32
  u32(1), // sum_u8(ptr, len) -> i32
  u32(2), // set_u8(ptr, index, value)
  u32(1), // get_u8(ptr, index) -> i32
  u32(3), // stats3(ptrA, ptrB, ptrC, len, outPtr)
  u32(2), // stats1(ptr, len, outPtr)
]));

const memorySection = section(5, vec([
  [0x00, ...u32(1)],
]));

function exportFunc(name, index) {
  return [...str(name), 0x00, ...u32(index)];
}

const exportSection = section(7, vec([
  [...str("memory"), 0x02, ...u32(0)],
  exportFunc("clear", 0),
  exportFunc("count_nonzero", 1),
  exportFunc("max_u8", 2),
  exportFunc("sum_u8", 3),
  exportFunc("set_u8", 4),
  exportFunc("get_u8", 5),
  exportFunc("stats3", 6),
  exportFunc("stats1", 7),
]));

function localGet(index) {
  return [0x20, ...u32(index)];
}

function localSet(index) {
  return [0x21, ...u32(index)];
}

function i32Const(value) {
  return [0x41, ...u32(value)];
}

function loadU8(ptrLocal, indexLocal, valueLocal) {
  return [
    ...localGet(ptrLocal), ...localGet(indexLocal), 0x6a, 0x2d, 0x00, 0x00,
    ...localSet(valueLocal),
  ];
}

function accumulateU8(valueLocal, nonzeroLocal, maxLocal, sumLocal) {
  return [
    0x02, 0x40,
      ...localGet(valueLocal), 0x45, 0x0d, 0x00,
      ...localGet(nonzeroLocal), ...i32Const(1), 0x6a, ...localSet(nonzeroLocal),
      ...localGet(sumLocal), ...localGet(valueLocal), 0x6a, ...localSet(sumLocal),
      0x02, 0x40,
        ...localGet(valueLocal), ...localGet(maxLocal), 0x4d, 0x0d, 0x00,
        ...localGet(valueLocal), ...localSet(maxLocal),
      0x0b,
    0x0b,
  ];
}

function storeI32(outPtrLocal, offset, valueLocal) {
  return [
    ...localGet(outPtrLocal), ...localGet(valueLocal), 0x36, 0x02, ...u32(offset),
  ];
}

const codeSection = section(10, vec([
  body([[1, I32]], [
    0x41, 0x00, 0x21, 0x02,
    0x02, 0x40,
      0x03, 0x40,
        0x20, 0x02, 0x20, 0x01, 0x4f, 0x0d, 0x01,
        0x20, 0x00, 0x20, 0x02, 0x6a, 0x41, 0x00, 0x3a, 0x00, 0x00,
        0x20, 0x02, 0x41, 0x01, 0x6a, 0x21, 0x02,
        0x0c, 0x00,
      0x0b,
    0x0b,
  ]),
  body([[2, I32]], [
    0x41, 0x00, 0x21, 0x02,
    0x41, 0x00, 0x21, 0x03,
    0x02, 0x40,
      0x03, 0x40,
        0x20, 0x02, 0x20, 0x01, 0x4f, 0x0d, 0x01,
        0x02, 0x40,
          0x20, 0x00, 0x20, 0x02, 0x6a, 0x2d, 0x00, 0x00,
          0x45, 0x0d, 0x00,
          0x20, 0x03, 0x41, 0x01, 0x6a, 0x21, 0x03,
        0x0b,
        0x20, 0x02, 0x41, 0x01, 0x6a, 0x21, 0x02,
        0x0c, 0x00,
      0x0b,
    0x0b,
    0x20, 0x03,
  ]),
  body([[3, I32]], [
    0x41, 0x00, 0x21, 0x02,
    0x41, 0x00, 0x21, 0x03,
    0x41, 0x00, 0x21, 0x04,
    0x02, 0x40,
      0x03, 0x40,
        0x20, 0x02, 0x20, 0x01, 0x4f, 0x0d, 0x01,
        0x20, 0x00, 0x20, 0x02, 0x6a, 0x2d, 0x00, 0x00, 0x21, 0x04,
        0x02, 0x40,
          0x20, 0x04, 0x20, 0x03, 0x4d, 0x0d, 0x00,
          0x20, 0x04, 0x21, 0x03,
        0x0b,
        0x20, 0x02, 0x41, 0x01, 0x6a, 0x21, 0x02,
        0x0c, 0x00,
      0x0b,
    0x0b,
    0x20, 0x03,
  ]),
  body([[2, I32]], [
    0x41, 0x00, 0x21, 0x02,
    0x41, 0x00, 0x21, 0x03,
    0x02, 0x40,
      0x03, 0x40,
        0x20, 0x02, 0x20, 0x01, 0x4f, 0x0d, 0x01,
        0x20, 0x03,
        0x20, 0x00, 0x20, 0x02, 0x6a, 0x2d, 0x00, 0x00,
        0x6a, 0x21, 0x03,
        0x20, 0x02, 0x41, 0x01, 0x6a, 0x21, 0x02,
        0x0c, 0x00,
      0x0b,
    0x0b,
    0x20, 0x03,
  ]),
  body([], [
    0x20, 0x00, 0x20, 0x01, 0x6a, 0x20, 0x02, 0x3a, 0x00, 0x00,
  ]),
  body([], [
    0x20, 0x00, 0x20, 0x01, 0x6a, 0x2d, 0x00, 0x00,
  ]),
  body([[11, I32]], [
    // locals: index, value, then nonzero/max/sum for each of the three maps.
    ...i32Const(0), ...localSet(5),
    ...i32Const(0), ...localSet(7),
    ...i32Const(0), ...localSet(8),
    ...i32Const(0), ...localSet(9),
    ...i32Const(0), ...localSet(10),
    ...i32Const(0), ...localSet(11),
    ...i32Const(0), ...localSet(12),
    ...i32Const(0), ...localSet(13),
    ...i32Const(0), ...localSet(14),
    ...i32Const(0), ...localSet(15),
    0x02, 0x40,
      0x03, 0x40,
        ...localGet(5), ...localGet(3), 0x4f, 0x0d, 0x01,
        ...loadU8(0, 5, 6),
        ...accumulateU8(6, 7, 8, 9),
        ...loadU8(1, 5, 6),
        ...accumulateU8(6, 10, 11, 12),
        ...loadU8(2, 5, 6),
        ...accumulateU8(6, 13, 14, 15),
        ...localGet(5), ...i32Const(1), 0x6a, ...localSet(5),
        0x0c, 0x00,
      0x0b,
    0x0b,
    ...storeI32(4, 0, 7),
    ...storeI32(4, 4, 8),
    ...storeI32(4, 8, 9),
    ...storeI32(4, 12, 10),
    ...storeI32(4, 16, 11),
    ...storeI32(4, 20, 12),
    ...storeI32(4, 24, 13),
    ...storeI32(4, 28, 14),
    ...storeI32(4, 32, 15),
  ]),
  body([[5, I32]], [
    // locals: index, value, nonzero, max, sum.
    ...i32Const(0), ...localSet(3),
    ...i32Const(0), ...localSet(5),
    ...i32Const(0), ...localSet(6),
    ...i32Const(0), ...localSet(7),
    0x02, 0x40,
      0x03, 0x40,
        ...localGet(3), ...localGet(1), 0x4f, 0x0d, 0x01,
        ...loadU8(0, 3, 4),
        ...accumulateU8(4, 5, 6, 7),
        ...localGet(3), ...i32Const(1), 0x6a, ...localSet(3),
        0x0c, 0x00,
      0x0b,
    0x0b,
    ...storeI32(2, 0, 5),
    ...storeI32(2, 4, 6),
    ...storeI32(2, 8, 7),
  ]),
]));

const moduleBytes = Buffer.from([
  0x00, 0x61, 0x73, 0x6d,
  0x01, 0x00, 0x00, 0x00,
  ...typeSection,
  ...functionSection,
  ...memorySection,
  ...exportSection,
  ...codeSection,
]);

const outputPath = path.resolve(__dirname, "../laravel-app/public/unfold-engine.wasm");
fs.writeFileSync(outputPath, moduleBytes);
console.log(`Wrote ${outputPath} (${moduleBytes.length} bytes)`);
