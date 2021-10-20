const stubs = {};

stubs.cpp = `
#include<iostream>
#include<stdio.h>

using namespace std;

int main(){
    cout<<"hello world!!";
    return 0;
}
`;

stubs.py = `
print('Hello world')
`;
export default stubs;
