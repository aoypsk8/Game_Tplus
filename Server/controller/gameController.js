const { poolPromise, sql } = require("../config/db");

class GameController {
    static async AddPoint(req, res) {
        const { points, phoneNumber } = req.params;

        try {
            const pool = await poolPromise;
            const existingUser = await pool.request()
                .input('phoneNumber', sql.VarChar, phoneNumber)
                .query('SELECT point, best_point FROM Tb_user_collect_point WHERE phonenumber = @phoneNumber');

            if (existingUser.recordset.length === 0) {
                const insertResult = await pool.request()
                    .input('phoneNumber', sql.VarChar, phoneNumber)
                    .input('points', sql.Int, points)
                    .query('INSERT INTO Tb_user_collect_point (phonenumber, point, best_point) VALUES (@phoneNumber, @points, @points)');

                if (insertResult.rowsAffected[0] === 1) {
                    return res.status(201).json({
                        status: "success",
                        message: `New user created with ${points} points for phone number ${phoneNumber}.`
                    });
                }

                return res.status(500).json({
                    status: "error",
                    message: "Failed to create a new user."
                });
            }

            const currentPoints = existingUser.recordset[0].point;
            const currentBestPoints = existingUser.recordset[0].best_point;
            const updatedPoints = currentPoints + parseInt(points, 10);
            const newBestPoints = Math.max(parseInt(points, 10), currentBestPoints);

            const updateResult = await pool.request()
                .input('updatedPoints', sql.Int, updatedPoints)
                .input('newBestPoints', sql.Int, newBestPoints)
                .input('phoneNumber', sql.VarChar, phoneNumber)
                .query('UPDATE Tb_user_collect_point SET point = @updatedPoints, best_point = @newBestPoints WHERE phonenumber = @phoneNumber');

            if (updateResult.rowsAffected[0] === 1) {
                return res.status(200).json({
                    status: "success",
                    message: `Added ${points} points for user with phone number ${phoneNumber}. ${newBestPoints > currentBestPoints ? `Best point updated to ${newBestPoints}.` : `Best point remains at ${currentBestPoints}.`}`
                });
            }
        } catch (error) {
            console.error("Database error in AddPoint:", error);
            res.status(500).json({
                status: "error",
                message: "Error adding points."
            });
        }
    }

    static async GetRanking(req, res) {
        try {
            const pool = await poolPromise;
            const ranking = await pool.request()
                .query('SELECT phonenumber, point, best_point FROM Tb_user_collect_point ORDER BY point DESC OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY');

            res.status(200).json({
                status: "success",
                data: ranking.recordset
            });
        } catch (error) {
            console.error("Database error in GetRanking:", error);
            res.status(500).json({
                status: "error",
                message: "Error retrieving the ranking."
            });
        }
    }

    static async GetUserRank(req, res) {
        const { phoneNumber } = req.params;
        try {
            const pool = await poolPromise;
            const ranking = await pool.request()
                .query('SELECT phonenumber, point, best_point FROM Tb_user_collect_point ORDER BY point DESC');
            
            const rank = ranking.recordset.findIndex(user => user.phonenumber === phoneNumber) + 1;

            if (rank === 0) {
                return res.status(404).json({
                    status: "error",
                    message: "User not found in the ranking"
                });
            }

            const user = ranking.recordset[rank - 1];
            res.status(200).json({
                status: "success",
                data: {
                    phoneNumber: user.phonenumber,
                    point: user.point,
                    best_point: user.best_point,
                    rank: rank
                }
            });
        } catch (error) {
            console.error("Database error in GetUserRank:", error);
            res.status(500).json({
                status: "error",
                message: "Error retrieving user rank."
            });
        }
    }

    static async ReducePoint(req, res) {
        const { points, phoneNumber } = req.params;
        try {
            const pool = await poolPromise;
            const existingUser = await pool.request()
                .input('phoneNumber', sql.VarChar, phoneNumber)
                .query('SELECT point FROM Tb_user_collect_point WHERE phonenumber = @phoneNumber');

            if (existingUser.recordset.length === 0) {
                return res.status(404).json({
                    status: "error",
                    message: "User not found"
                });
            }

            const currentPoints = existingUser.recordset[0].point;
            const pointsToReduce = parseInt(points, 10);

            if (currentPoints < pointsToReduce) {
                return res.status(400).json({
                    status: "error",
                    message: "Insufficient points to reduce"
                });
            }

            const updatedPoints = currentPoints - pointsToReduce;
            const updateResult = await pool.request()
                .input('updatedPoints', sql.Int, updatedPoints)
                .input('phoneNumber', sql.VarChar, phoneNumber)
                .query('UPDATE Tb_user_collect_point SET point = @updatedPoints WHERE phonenumber = @phoneNumber');

            if (updateResult.rowsAffected[0] === 1) {
                res.status(200).json({
                    status: "success",
                    message: `${pointsToReduce} points reduced for user with phone number ${phoneNumber}. Remaining points: ${updatedPoints}`
                });
            } else {
                res.status(500).json({
                    status: "error",
                    message: "Error reducing points."
                });
            }
        } catch (error) {
            console.error("Database error in ReducePoint:", error);
            res.status(500).json({
                status: "error",
                message: "Error reducing points."
            });
        }
    }

    static async GetPackage(req, res) {
        try {
            const pool = await poolPromise;
            const packages = await pool.request().query('SELECT * FROM Tb_packages_points_game ORDER BY points ASC');
            res.status(200).json({
                status: "success",
                data: packages.recordset
            });
        } catch (error) {
            console.error("Database error :", error);
            res.status(500).json({
                status: "error",
                message: "Error retrieving user rank."
            });
        }
    }
    

}

module.exports = GameController;
