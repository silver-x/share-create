/*
/// Module: share_contract
module share_contract::share_contract;
*/

// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions

module share_contract::share {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::table::{Self, Table};
    use std::string::{Self, String};
    use sui::clock::{Self, Clock};

    // 错误码
    const ENotAuthorized: u64 = 1;
    const EShareNotFound: u64 = 2;
    const EInvalidContent: u64 = 3;

    // 分享对象结构
    public struct Share has key, store {
        id: UID,
        title: String,
        content: String,
        creator: address,
        created_at: u64,
        updated_at: u64,
    }

    // 分享集合结构
    public struct ShareCollection has key {
        id: UID,
        shares: Table<u64, Share>,
        next_share_id: u64,
    }

    // 事件
    public struct ShareCreated has copy, drop {
        share_id: u64,
        creator: address,
        title: String,
        created_at: u64,
    }

    public struct ShareUpdated has copy, drop {
        share_id: u64,
        title: String,
        updated_at: u64,
    }

    // 初始化函数
    fun init(ctx: &mut TxContext) {
        let share_collection = ShareCollection {
            id: object::new(ctx),
            shares: table::new(ctx),
            next_share_id: 0,
        };

        // 将集合转移给发送者
        transfer::share_object(share_collection);
    }

    // 创建分享
    public entry fun create_share(
        collection: &mut ShareCollection,
        title: vector<u8>,
        content: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // 验证输入
        assert!(title.length() > 0, EInvalidContent);
        assert!(content.length() > 0, EInvalidContent);

        let share_id = collection.next_share_id;
        let creator = tx_context::sender(ctx);
        let timestamp = clock::timestamp_ms(clock);

        let share = Share {
            id: object::new(ctx),
            title: string::utf8(title),
            content: string::utf8(content),
            creator,
            created_at: timestamp,
            updated_at: timestamp,
        };

        // 添加到集合
        table::add(&mut collection.shares, share_id, share);
        collection.next_share_id = share_id + 1;

        // 发出事件
        event::emit(ShareCreated {
            share_id,
            creator,
            title: string::utf8(title),
            created_at: timestamp,
        });
    }

    // 更新分享
    public entry fun update_share(
        collection: &mut ShareCollection,
        share_id: u64,
        new_title: vector<u8>,
        new_content: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // 验证输入
        assert!(new_title.length() > 0, EInvalidContent);
        assert!(new_content.length() > 0, EInvalidContent);

        let share = table::borrow_mut(&mut collection.shares, share_id);
        let creator = tx_context::sender(ctx);

        // 验证权限
        assert!(share.creator == creator, ENotAuthorized);

        // 更新内容
        share.title = string::utf8(new_title);
        share.content = string::utf8(new_content);
        share.updated_at = clock::timestamp_ms(clock);

        // 发出事件
        event::emit(ShareUpdated {
            share_id,
            title: string::utf8(new_title),
            updated_at: share.updated_at,
        });
    }

    // 获取分享
    public fun get_share(collection: &ShareCollection, share_id: u64): &Share {
        table::borrow(&collection.shares, share_id)
    }

    // 获取分享数量
    public fun get_share_count(collection: &ShareCollection): u64 {
        collection.next_share_id
    }
}
