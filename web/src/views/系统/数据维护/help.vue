<template>
    <n-alert show-icon type="info">
        假设操纵的库为 <Tag size="small">User</Tag>，存在一个用户表<Tag size="small">user</Tag>（包含字段：id、name、pwd）
    </n-alert>

    <n-table size="small" :bordered="true" striped class="mt-2">
        <thead>
            <tr>
                <th width="20%">场景</th>
                <th width="40%">MySQL</th>
                <th width="40%">SQLite3</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>切换库</td>
                <td>USE user</td>
                <td>无需切换</td>
            </tr>
            <tr>
                <td>查询表</td>
                <td>SHOW TABLES</td>
                <td>SELECT name FROM sqlite_master WHERE type = 'table'</td>
            </tr>
            <tr>
                <td>新建表</td>
                <td>CREATE TABLE user (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(50), pwd VARCHAR(255))</td>
                <td>CREATE TABLE user (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, pwd TEXT)</td>
            </tr>
            <tr>
                <td>删除表</td>
                <td colspan="2" class="info">DROP TABLE IF EXISTS user</td>
            </tr>
            <tr>
                <th>插入数据行</th>
                <td colspan="2" class="info">INSERT INTO user (name, pwd) VALUES ('admin', '123456')</td>
            </tr>
            <tr>
                <td>更新数据行</td>
                <td colspan="2" class="info">UPDATE user SET name='changed' WHERE id=1</td>
            </tr>
            <tr>
                <td>删除数据行</td>
                <td colspan="2" class="info">DELETE FROM user WHERE id=1</td>
            </tr>
            <tr>
                <td>修改表名称</td>
                <td colspan="2" class="info">ALTER TABLE user RENAME TO user2</td>
            </tr>
            <tr>
                <td>截断（重置表）</td>
                <td>TRUNCATE TABLE user</td>
                <td>DELETE FROM user;
                    <div><n-text depth="3">-- SQLite版本需支持 sqlite_sequence 表</n-text></div>
                    DELETE FROM sqlite_sequence WHERE name='user';</td>
            </tr>
            <tr>
                <td>更新表</td>
                <td>
                    <div><n-text depth="3">--修改字段类型</n-text></div>
                    ALTER TABLE user MODIFY name TEXT
                    <div><n-text depth="3">--修改字段名</n-text></div>
                    ALTER TABLE user CHANGE name name2
                    <div><n-text depth="3">--同时修改字段名称、类型</n-text></div>
                    ALTER TABLE user CHANGE name name2 VARCHAR(100)
                </td>
                <td>
                    <n-text depth="3">SQLite的ALTER TABLE命令功能较为有限，直接修改字段名称和类型的功能并不直接支持。不过，可以通过创建新表、复制数据、删除旧表的方法来实现这一目的😔</n-text>
                </td>
            </tr>
            <tr>
                <td>新增字段</td>
                <td>ALTER TABLE user ADD address VARCHAR(200);</td>
                <td>ALERT TABLE user ADD address TEXT;</td>
            </tr>
            <tr>
                <td>查看表信息</td>
                <td>DESC user</td>
                <td>PRAGMA table_info(user)</td>
            </tr>
        </tbody>
    </n-table>
</template>
