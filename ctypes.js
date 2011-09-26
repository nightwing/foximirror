Components.utils.import("resource://gre/modules/ctypes.jsm");  

var WM_COPYDATA = 74;
var PROCESS_QUERY_INFORMATION = 0x0400;
var PROCESS_VM_READ = 0x0010;
var CP_ACP = 0;

var DWORD = ctypes.uint32_t;
var UINT = ctypes.unsigned_int;
var BOOL = ctypes.bool;
var HANDLE = ctypes.size_t;
var HWND = HANDLE;
var HMODULE = HANDLE;
var WPARAM = ctypes.size_t;
var LPARAM = ctypes.size_t;
var LRESULT = ctypes.size_t;
var ULONG_PTR = ctypes.uintptr_t;
var PVOID = ctypes.voidptr_t;
var LPCTSTR = ctypes.jschar.ptr;
var LPCWSTR = ctypes.jschar.ptr;
var LPTSTR = ctypes.jschar.ptr;
var LPSTR = ctypes.char.ptr;
var LPCSTR = ctypes.char.ptr;
//var POINT = new ctypes.StructType("POINT", [{x: ctypes.long}, {y: ctypes.long}]);
var POINT = new ctypes.StructType("POINT", [{x: ctypes.int}, {y: ctypes.int}]);

var CallBackABI;
var WinABI;

if (ctypes.size_t.size == 8) {
    CallBackABI = ctypes.default_abi;
	WinABI = ctypes.default_abi;
} else {
	CallBackABI = ctypes.stdcall_abi;
	WinABI = ctypes.winapi_abi;
}
var EnumWindowsProc = ctypes.FunctionType(CallBackABI, BOOL, [HWND, LPARAM]);
#>>-----------------------------------------------------------------------------------*/
UnLoaddlls = function() {
	user32dll.close();
	kernel32dll.close();
	gdi32dll.close();
}

Loaddlls = function() {
	user32dll = ctypes.open('user32.dll');
	kernel32dll = ctypes.open('kernel32.dll');
	gdi32dll = ctypes.open('gdi32.dll');

	FindWindow = user32dll.declare('FindWindowW', WinABI, HWND,   LPCTSTR, LPCTSTR);

	EnumWindows = user32dll.declare('EnumWindows', WinABI, BOOL,   EnumWindowsProc.ptr, LPARAM);
	EnumWindows = user32dll.declare('EnumChildWindows', WinABI, BOOL,   HWND, EnumWindowsProc.ptr, LPARAM);
	GetClassName = user32dll.declare('GetClassNameW', WinABI, ctypes.int,   HWND, LPTSTR, ctypes.int);
		
	GetCursorPos = user32dll.declare('GetCursorPos', WinABI, BOOL,   POINT.ptr);
	SetCursorPos = user32dll.declare('SetCursorPos', WinABI, BOOL,   ctypes.int32_t, ctypes.int32_t);
	WindowFromPoint = user32dll.declare('WindowFromPoint', WinABI, HWND,   POINT);
	ChildWindowFromPoint = user32dll.declare('ChildWindowFromPoint', WinABI, HWND,   HWND, POINT);
}
Loaddlls()
#>>-----------------------------------------------------------------------------------*/


p=new POINT
GetCursorPos(p.address())

SetCursorPos(p.x+10,p.y+30)
h = WindowFromPoint(p)


#>>

//gdi32dll.declare("GetDC", WinABI, BOOL, UINT)
i = user32dll.declare("GetDC", WinABI ,UINT, UINT)
j = user32dll.declare("ReleaseDC", WinABI ,ctypes.int ,UINT, UINT)
sb = gdi32dll.declare("StretchBlt", WinABI, BOOL, 
    UINT, ctypes.int, ctypes.int,ctypes.int,ctypes.int, /*dest*/
    UINT, ctypes.int, ctypes.int,ctypes.int,ctypes.int, /*src*/
	UINT /**/
)
sbm = gdi32dll.declare("SetStretchBltMode", WinABI, BOOL, 
    UINT, ctypes.int
)

//DllCall("GetDC", UINT, null)
t=Date.now()
ddc = i(0)
wdc = i(h)

sbm(wdc, 0)
sbm(ddc, 0)
sb(wdc,0,0,100,100, ddc,1,1,20,20, 0xCC0020)


j(0, ddc)
j(h, wdc)

t-Date.now()








 
  ChildWindowFromPoint(h, p)







#>>

	
  

  FindWindow("MozillaUIWindowClass", "")
  FindWindow("Notepad++", "")
  
#>>
  function SearchPD(hwnd, lParam) {
    var result = true;

    var buf = new new ctypes.ArrayType(ctypes.jschar, 255);
    GetClassName(hwnd, buf, 255);
    ans.push([buf.readString(),hwnd])
    return true
    if (buf.readString() == 'TMainForm') {
      var PID = new DWORD;
      GetWindowThreadProcessId(hwnd, PID.address());
      var PName = ProcessFileName(PID.address().contents);
      if (PName.toLowerCase() == 'pdownloadmanager.exe') {
        LPARAM.ptr(lParam).contents = hwnd;
        result = false;
      }
    }
    return result;
  }
ans=[]

SearchPD_ptr = EnumWindowsProc.ptr(SearchPD);
 var wnd = LPARAM(0);
 
          EnumWindows(SearchPD_ptr, ctypes.cast(wnd.address(), LPARAM));

  ans
  
  
  
  
#>>

keybd_event = user32dll.declare('keybd_event', WinABI, PVOID, ctypes.int, ctypes.int,DWORD, ULONG_PTR);

keybd_event(0x14, 0, 0x0001|0, 0)
keybd_event(0x14, 0, 0x0001|0x0002, 0)


#>>

GetKeyState = user32dll.declare('GetKeyState', WinABI, ctypes.short, ctypes.int);
//CreateWindow(0x00000080, 'u', 'i', 0x10000000, 10,10,100,100)
GetKeyState(13)

ctypes
var pb = new ctypes.ArrayType(ctypes.char, 256)
var buf = new pb() ;
buf
GetKeyboardState = user32dll.declare('GetKeyboardState', WinABI, BOOL, pb.ptr);
SetKeyboardState = user32dll.declare('SetKeyboardState', WinABI, BOOL, pb.ptr);
GetKeyboardState(buf.address())

a = buf.toString().slice(24,-2).split(',').map(function(x)x=='true'||true)
//buf=new pb(a)
//buf
//SetKeyboardState(buf.address())
//GetKeyboardState(buf.address())
;[buf[13]&1,buf[14]&1]
//aaaaa







CreateWindow = user32dll.declare('CreateWindowExW', WinABI, HWND,
    DWORD,LPCTSTR,LPCTSTR,DWORD,
    ctypes.int,ctypes.int,ctypes.int,ctypes.int,
    HWND, ctypes.long,ctypes.long, ctypes.voidptr_t
);
ShowWindow  = user32dll.declare('ShowWindow', WinABI, ctypes.long,
    ctypes.long,ctypes.long
);
DestroyWindow = user32dll.declare('DestroyWindow', WinABI, ctypes.long, HWND)
DestroyWindow(h)
WS_POPUP=0x80000000
WS_BORDER=0x00800000

h=CreateWindow(
    392, "MozillaWindowClass", "hello r" , 2496593920,// GetWindowLong(h, -20)  GetWindowLong(h, -16)
    100, 100, 200, 200,
    0,0,0,null)
	
 ShowWindow(h, 4)
 
 
 
    var buf = new new ctypes.ArrayType(ctypes.jschar, 255);
    GetClassName(h, buf, 255);
    buf.readString()
    GetClassLong  = user32dll.declare('GetClassLongW', WinABI, DWORD, HWND, ctypes.int)
    GetWindowLong  = user32dll.declare('GetWindowLongW', WinABI, DWORD, HWND, ctypes.int)  
    GetWindowLong(h, -20)
    GetWindowLong(h, -16)