var number = "";
var binary = ["+","-","*","/","^"];
var noOfParenthesis = 0;
window.onload = function(){
    let s = document.getElementsByClassName('number');
    for(let i = 0;i<s.length;i++){
        s[i].addEventListener("click",getNumber);
    }
    s = document.getElementsByClassName('oButtons');
    for(let i = 0;i<s.length;i++){
        if(s[i].id == "delete"){
            s[i].addEventListener("click",function(){
                deleteString(CountLetter(number));
            })
        }
        else if(s[i].id == "erase"){
            s[i].addEventListener("click",function(){
                deleteString(number.length);
            })
        }
        else if(s[i].id == "equalTo"){
            s[i].addEventListener("click", function(){
                for(let i =0;i<noOfParenthesis;i++){
                    number += ")";
                }
                let calc = new Calculator(number);
                calc.resolve();
                document.getElementById("text").innerHTML = calc.evaluatePostfix(calc.convertToPostfix(calc.split()));
                noOfParenthesis = 0;
            })
        }
        else{
            s[i].addEventListener("click",getNumber);
        }
    }

}
//Gets the count of the letters to delete, return 0 if the last char is not a letter
function CountLetter(n){
    let count = 0;
    let reg = /[a-z]/;
    while(reg.test(n.charAt(n.length-count-1).toLowerCase())){
        count++;
    }
    return count;
}
function deleteString(count){
    if(number[number.length-1] == "("){
        noOfParenthesis--;
    }
    if(number[number.length-1] == ")"){
        noOfParenthesis++;
    }
    if (count==0){
        count++;
    }
    number = number.substring(0,number.length-count);
    document.getElementById("text").textContent = number;     
}
//TODO call the other method here;
function getNumber(){
    //TODO add unary
    if(this.innerHTML.endsWith("(")){
        noOfParenthesis++;
    }
    if(this.innerHTML.endsWith(")")){
        noOfParenthesis--;
    }
    if(!binary.includes(this.innerHTML) && number.endsWith(")") && this.innerHTML != ")"){
        number += "*";
    }else if(number.length >0 && (this.className == "oButtons trig" || this.innerHTML == "(") ){
        if(!binary.includes(number[number.length-1]) && !number.endsWith("(")){
            number += "*";
        }
    }
    number += this.innerHTML;
    document.getElementById("text").textContent = number;
}
function Calculator(s) {
    String.prototype.insertAt = function(string, index){
        return  this.substr(0,index) + string + this.substr(index);
    }
    this.text = s;

    this.array = Array();
    this.op = ["^", "/","*","-","+"];
    this.unary = {
        "+" : {"left" : function() {
            return true;
        }},
        "-" : {"left" : function() {
            return true;
        }},
        // "!" : {"left" : function() {
        //     return false;
        // }},
        "%" : {"left" : function() {
            return false;
        }},
        "ContainsKey" : function (str) {
            return str in this;
        }
    }
    this.trig = ["sin", "cos", "tan", "tanInverse", "cosInverse", "sinInverse", "ln", "e", "log"];
    this.binary = ["+","-","*","/","^","("];
    this.operators = {
        ")" : {"isp" : -1, "icp": 0},
        "(" : {"isp" : 0, "icp" : 9},
        "operand" :{"isp" : 8, "icp": 7},
        "^" : {"isp" : 5, "icp" : 6},
        "/" : {"isp" : 4, "icp" : 3},
        "*" : {"isp" : 4, "icp" : 3},
        "-" :{"isp" : 2, "icp" : 1},
        "+" :{"isp" : 2, "icp" : 1},
        "trig" : {"isp" : 8, "icp" : 7},
        "keyContains" : function (str) {
            return str in this;
        }
    }
    this.operations = {
        "+" : (a,b) => a+b,
        "-" : (a,b) => a-b,
        "*" : (a,b) => a*b,
        "/" : (a,b) => a/b,
        "^" : (a,b) => Math.pow(a,b),
        "sin" : (a) => Math.sin(a),
        "cos" : (a) => Math.cos(a),
        "tan" : (a) => Math.tan(a),
        "sinInverse" : (a) => Math.asin(a),
        "cosInverse" : (a) => Math.acos(a),
        "tanInverse" : (a) => Math.atan(a),
        "log" : (a) => Math.log10(a),
        "ln" : (a) => Math.log(a),
        "e" : () => Math.E,
        "%" : (a,b) => a%b
    }
    this.isp = function(str){
        if(this.isNumber(str)){
            return this.operators["operand"]["isp"];
        }
        if(this.trig.includes(str)){
            return this.operators["trig"]["isp"];
        }
        return this.operators[str]["isp"];
    }
    this.icp = function(str){
        if(this.isNumber(str)){
            return this.operators["operand"]["icp"];
        }
        if(this.trig.includes(str)){
            return this.operators["trig"]["icp"];
        }
        return this.operators[str]["icp"];
    }
    this.resolve = function(){
        console.log(this.text);
        let text = this.text;
        let n = text.length - 1;
        if(this.binary.includes(text[n])){
            return;
        }
        
        let seenNumber = false;
        
        let index = 0;
        let i =n;
        while(i>=0){
            if(this.unary.ContainsKey(text[i]) && !this.unary[text[i]].left()){
                seenNumber = false;
                text = text.insertAt(")",i+1);
                if(this.isNumber(text[--i])){
                    index = i+1;
                    while(this.operators.keyContains(text[i]) && i>=0){
                        i--;
                    }
                    text = text.insertAt("(",i)
                    index++;
                }else if(text[i-1] == ")"){
                    i--;
                    while(text[i] != "(" && i>=0){
                        i--;
                    }
                    text = text.insertAt("(",i)
                    index++;
                }

            }else if(this.unary.ContainsKey(text[i]) && this.unary[text[i]].left()){
                seenNumber = false;
                if(!(this.isNumber(text[i-1]) || text[i-1]== ")")){
                    text = text.insertAt("(0",i);
                    index+=2
                    
                    text = text.insertAt(")",index);
                }
                i--;
            }else if(this.isNumber(text[i]) && !seenNumber){
                seenNumber =  true;
                index = i + 1;
                i--;
            }
            else{
                i--;
            }
        }
        this.text = text;
        console.log(this.text);
    }
    this.isNumber = function(str){
        let reg = /[0-9]/; 
        return reg.test(str) || str.includes(".") || str.includes("!");
    }
    this.isLetter = function(str){
        let reg = /[a-z]/;
        return reg.test(str);
    }
    // this.addMultiply = function(){
    //     let newText = "";
    //     let s = "";
    //     for(let i = 0;i<this.text.length-1;i++){
    //         s = this.text[i];
    //         newText += s;
    //         if((this.isNumber(i) || s == ")") && this.text[i+1] == "("){
    //             newText += "*";
    //         }
    //         else if(this.isNumber(i) && this.isLetter(i+1)){
    //             newText += "*";
    //         }
    //     }
    //     newText += this.text[this.text.length-1];
    //     console.log(newText);
    //     this.text = newText;
    //     return newText;
    // }
    this.parenthesed = function(){
        let s = "";
        let former = "";
        let unary = false;
        for(let i = 1;i<this.text.length;i++){
            if(unary && (this.op.includes(this.text[i] || this.isLetter(this.text[i])))){
                s += ")";
                unary = false;
            }else if(this.text[i] == "-" || this.text[i] == "+"){
                s += "(0";
                unary = true;
            }
            s += this.text[i];
            //if()
        }
        this.text = s;
        console.log(this.text);
    }
    this.split = function(){
        let a=this.text;
        let c= '';
        let array = [];
        i = 0;
        while(i<a.length){
            if(this.isNumber(a[i])){
                do{
                    c += a[i];
                    //a = a.substring(i+1);
                    i++;
                }while(i<a.length && this.isNumber(a[i]));
                array.push(c);
                c = "";
            }
            else if(this.isLetter(a[i])){
                do{
                    c += a[i];
                    //a = a.substring(i+1);
                    i++;
                }while(i<a.length && this.isLetter(a[i]));
                array.push(c);
                c = "";
            }
            else if(this.operators.keyContains(a[i])){
               array.push(a[i]);
               i++;
            }
            
        }
        console.log(array);
        return array;
    }
    this.convertToPostfix = function(array){
        array.push(")");
        let stack = [];
        let output = [];
        stack.push("(");
        x = "";
        array = array.reverse();
        while(stack.length > 0){
            item = array.pop();
            x = stack.pop();
            if(this.isNumber(item)){
                stack.push(x);
                output.push(item);
            }else if(item == ")"){
                while(x != "("){
                    output.push(x);
                    x = stack.pop();
                }
            }else if(this.isp(x) >= this.icp(item)){
                while(this.isp(x) >= this.icp(item)){
                    output.push(x);
                    x = stack.pop();
                }
                stack.push(x);
                stack.push(item);
            }else if(this.isp(x) < this.icp(item)){
                stack.push(x);
                stack.push(item);
            }else{
                throw new Error("Syntax error");
            }
        }
        console.log(output);
        return output;
    }

    this.fact = function(n) {
        if(n==0)
            return 1;
        else return n* this.fact(n-1);
    }
    this.evaluatePostfix= function(array){
        array.push("#");
        let stack = [];
        index = 0;
        let item = array[index];
        let t;
        while(item != "#"){
            if(this.isNumber(item)){
                if(item.includes("!")){
                    stack.push(this.fact(Number (item.substr(0,item.length-1))))
                }
                else{
                    stack.push(item);
                }
            }else{
                if(this.trig.includes(item)){
                    y = Number(stack.pop());
                    t = this.operations[item](y);
                }else{
                    y = Number(stack.pop());
                    x = Number(stack.pop());
                    t = this.operations[item](x,y)
                }
                stack.push(t);
            }
            index++;
            item = array[index];
        }
        return stack.pop();
    }
    }
    
    