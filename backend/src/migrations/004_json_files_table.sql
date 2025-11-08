-- Add json_files table for JSON file management
CREATE TABLE IF NOT EXISTS json_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) UNIQUE NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_json_files_filename ON json_files(filename);
CREATE INDEX IF NOT EXISTS idx_json_files_created_at ON json_files(created_at);

-- Create trigger for updated_at
CREATE TRIGGER update_json_files_updated_at BEFORE UPDATE ON json_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
