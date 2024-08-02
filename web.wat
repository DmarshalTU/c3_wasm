(module $web.wasm
  (type (;0;) (func (result i32)))
  (type (;1;) (func (param i32 i32 i32)))
  (type (;2;) (func (param i32)))
  (func $web__rand (type 0) (result i32)
    i32.const 231794730)
  (func $web__to_hex (type 1) (param i32 i32 i32)
    (local i32 i32)
    block  ;; label = @1
      local.get 2
      i32.const -1
      i32.add
      local.tee 3
      i32.const 0
      i32.lt_s
      br_if 0 (;@1;)
      local.get 0
      i32.load
      local.set 4
      block  ;; label = @2
        block  ;; label = @3
          local.get 2
          i32.const 3
          i32.and
          local.tee 0
          br_if 0 (;@3;)
          local.get 3
          local.set 2
          br 1 (;@2;)
        end
        local.get 3
        local.set 2
        loop  ;; label = @3
          local.get 4
          local.get 2
          i32.add
          local.get 1
          i32.const 15
          i32.and
          i32.const 1024
          i32.add
          i32.load8_u
          i32.store8
          local.get 2
          i32.const -1
          i32.add
          local.set 2
          local.get 1
          i32.const 4
          i32.shr_u
          local.set 1
          local.get 0
          i32.const -1
          i32.add
          local.tee 0
          br_if 0 (;@3;)
        end
      end
      local.get 3
      i32.const 3
      i32.lt_u
      br_if 0 (;@1;)
      local.get 4
      i32.const -3
      i32.add
      local.set 4
      loop  ;; label = @2
        local.get 4
        local.get 2
        i32.add
        local.tee 0
        i32.const 3
        i32.add
        local.get 1
        i32.const 15
        i32.and
        i32.const 1024
        i32.add
        i32.load8_u
        i32.store8
        local.get 0
        i32.const 2
        i32.add
        local.get 1
        i32.const 4
        i32.shr_u
        i32.const 15
        i32.and
        i32.const 1024
        i32.add
        i32.load8_u
        i32.store8
        local.get 0
        i32.const 1
        i32.add
        local.get 1
        i32.const 8
        i32.shr_u
        i32.const 15
        i32.and
        i32.const 1024
        i32.add
        i32.load8_u
        i32.store8
        local.get 0
        local.get 1
        i32.const 12
        i32.shr_u
        i32.const 15
        i32.and
        i32.const 1024
        i32.add
        i32.load8_u
        i32.store8
        local.get 1
        i32.const 16
        i32.shr_u
        local.set 1
        local.get 2
        i32.const -4
        i32.add
        local.tee 2
        i32.const -1
        i32.ne
        br_if 0 (;@2;)
      end
    end)
  (func $generate_id (type 2) (param i32)
    local.get 0
    i32.const 36
    i32.store offset=4
    local.get 0
    i32.const 1041
    i32.store)
  (func $generate_package_id (type 0) (result i32)
    i32.const 123)
  (memory (;0;) 2)
  (global $__stack_pointer (mut i32) (i32.const 66624))
  (export "memory" (memory 0))
  (export "web__rand" (func $web__rand))
  (export "web__to_hex" (func $web__to_hex))
  (export "generate_id" (func $generate_id))
  (export "generate_package_id" (func $generate_package_id))
  (data $.rodata (i32.const 1024) "0123456789ABCDEF\0000000000-0000-4000-8000-000000000000\00"))
