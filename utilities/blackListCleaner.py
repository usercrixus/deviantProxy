import sys

def remove_duplicates(file1_path, file2_path, output_file_path):
    unique_lines = set()
    
    # Processing the first file
    with open(file1_path, 'r') as file1:
        for line in file1:
            if not line.startswith("#"):
                unique_lines.add(line)
    
    # Processing the second file
    with open(file2_path, 'r') as file2:
        for line in file2:
            if not line.startswith("#"):
              unique_lines.add(line)
    
    # Writing the unique lines to the output file
    with open(output_file_path, 'w') as output_file:
        for line in unique_lines:
            output_file.write(line)

remove_duplicates(sys.argv[1], sys.argv[2], sys.argv[3])