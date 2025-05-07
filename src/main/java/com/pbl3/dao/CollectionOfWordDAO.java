/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.dao;

import com.pbl3.dto.CollectionOfWord;
import com.pbl3.util.DBUtil;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

/**
 *
 * @author Hoang Duong
 */
public class CollectionOfWordDAO implements DAOInterface<CollectionOfWord>{
    @Override
    public int insert(CollectionOfWord item) {
        try (Connection conn = DBUtil.makeConnection();
             PreparedStatement ps = conn.prepareStatement(
                 "INSERT INTO collection_has_word (collection_id, word_id) VALUES (?, ?)")) {
            ps.setInt(1, item.getCollection_id());
            ps.setInt(2, item.getWord_id());
            return ps.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return 0;
    }

    @Override
    public int update(CollectionOfWord item) {
        try (Connection conn = DBUtil.makeConnection();
             PreparedStatement ps = conn.prepareStatement(
                 "UPDATE collection_has_word SET collection_id = ?, word_id = ? WHERE collection_word_id = ?")) {
            ps.setInt(1, item.getCollection_id());
            ps.setInt(2, item.getWord_id());
            ps.setInt(3, item.getCollection_word_id());
            return ps.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return 0;
    }

   

    @Override
    public int delete(int id) {
        try (Connection conn = DBUtil.makeConnection();
             PreparedStatement ps = conn.prepareStatement(
                 "DELETE FROM collection_has_word WHERE collection_word_id = ?")) {
            ps.setInt(1, id);
            return ps.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return 0;
    }

    @Override
    public ArrayList<CollectionOfWord> selectAll() {
        ArrayList<CollectionOfWord> list = new ArrayList<>();
        try (Connection conn = DBUtil.makeConnection();
             PreparedStatement ps = conn.prepareStatement("SELECT * FROM collection_has_word");
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(new CollectionOfWord(
                    rs.getInt("collection_word_id"),
                    rs.getInt("collection_id"),
                    rs.getInt("word_id")
                ));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    @Override
    public CollectionOfWord selectByID(int id) {
        try (Connection conn = DBUtil.makeConnection();
             PreparedStatement ps = conn.prepareStatement(
                 "SELECT * FROM collection_has_word WHERE collection_word_id = ?")) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new CollectionOfWord(
                        rs.getInt("collection_word_id"),
                        rs.getInt("collection_id"),
                        rs.getInt("word_id")
                    );
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override
    public CollectionOfWord selectByCondition(String condition) {
        // Có thể mở rộng nếu cần
        return null;
    }
}
