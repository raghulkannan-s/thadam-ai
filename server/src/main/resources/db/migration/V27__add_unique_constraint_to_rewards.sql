DELETE FROM coin_transactions
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY user_id, transaction_type, reference_type, reference_id
                   ORDER BY created_at ASC
               ) AS row_num
        FROM coin_transactions
        WHERE transaction_type = 'EARNED'
    ) t
    WHERE t.row_num > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_coin_txn_unique_reward 
ON coin_transactions(user_id, transaction_type, reference_type, reference_id) 
WHERE transaction_type = 'EARNED';
