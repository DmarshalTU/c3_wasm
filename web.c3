fn uint rand() @wasm {
    uint seed = 123456789;
    seed = seed * 1103515245 + 12345;
    return seed & 0x7FFFFFFF;
}

fn void to_hex(String buffer, uint value, int length) @wasm {
    String hex_chars = "0123456789ABCDEF";
    for (int i = length - 1; i >= 0; i--) {
        buffer[i] = hex_chars[value & 0xF];
        value >>= 4;
    }
}

fn String generate_id() @extern("generate_id") @wasm {
    String id = "00000000-0000-4000-8000-000000000000";
    uint value = rand();
    to_hex(id[0..8], value, 8);  // Pass the correct slice of the string
    return id;
}


fn int generate_package_id() @extern("generate_package_id") @wasm {
    return 123;
}
