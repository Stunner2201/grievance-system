const Department = require('../models/Department');

class MLRoutingService {
  static async predictDepartment(complaintText) {
    const keywords = this.extractKeywords(complaintText);
    const departments = await Department.findByKeywords(keywords);
    
    if (departments.length > 0) {
      return departments.sort((a, b) => 
        this.countMatches(b.keywords, keywords) - 
        this.countMatches(a.keywords, keywords)
      )[0].id;
    }
    return null;
  }

  static extractKeywords(text) {
    const commonWords = new Set(['the', 'and', 'for', 'this', 'that', 'have']);
    const words = text.toLowerCase().split(/\W+/);
    return [...new Set(words.filter(word => 
      word.length > 3 && !commonWords.has(word)
    ))];
  }

  static countMatches(keywords, targetKeywords) {
    return keywords.filter(k => targetKeywords.includes(k)).length;
  }
}

module.exports = MLRoutingService;