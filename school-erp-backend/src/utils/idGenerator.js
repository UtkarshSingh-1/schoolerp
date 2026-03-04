exports.generateStudentId = (branchCode, year, serial) => {
    return `${branchCode}-${year}-${String(serial).padStart(4, '0')}`;
};
