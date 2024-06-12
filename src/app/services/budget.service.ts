import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {

  constructor(private _httpClient: HttpClient,) { }

  
  getSuggestion(param:string): Observable<any> {
    return this._httpClient.post(environment.apiUrl + 'budget/suggestion',{ param : param});
  }

  categoryList(type:string): Observable<any> {
    return this._httpClient.post(environment.apiUrl + 'budget/category-list',{ type : type});
  }

  getList(type: number, queryParam ?: string, category ?: number,
    startDate ?: number,
    endDate ?: number
    ): Observable<any> {
    // 0 : All
    // 1 : Savings
    // 2 : expense 
    // 3  : income  
    return this._httpClient.post(environment.apiUrl + 'budget/get-list', 
    { type : type, queryParam : queryParam,
      category : category ,
      startDate : startDate,
      endDate : endDate

    });
  }

  getDetails(transactionId: number): Observable<any> {
    return this._httpClient.get(environment.apiUrl + 'budget/get/'+transactionId);
  }

  addExpense(expenseData: any): Observable<any> {
    return this._httpClient.post(environment.apiUrl + 'budget/add', expenseData);
  }

  deleteTransaction(id: number): Observable<any> {
    return this._httpClient.post(environment.apiUrl + 'budget/delete/', {id : id});
  }

  updateExpense(expenseData: any): Observable<any> {
    return this._httpClient.post(environment.apiUrl + 'budget/update', expenseData);
  }

  statistics(request: any): Observable<any> {
    return this._httpClient.post(environment.apiUrl + 'budget/statistics', request);
  }

  downloadImage(imageUrl: string): Observable<Blob> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/octet-stream' });
    return this._httpClient.get(imageUrl, { responseType: 'blob', headers: headers });
  }
}
